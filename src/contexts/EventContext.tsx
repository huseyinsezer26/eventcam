import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Event } from '../types/event';
import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  getDoc, 
  doc,
  query,
  where,
  getDocs,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  limit,
  writeBatch
} from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { createEventFolder } from '../lib/api';
import toast from 'react-hot-toast';

interface EventContextType {
  createNewEvent: (eventData: Omit<Event, 'id' | 'createdAt' | 'photos' | 'userId' | 'driveId'>) => Promise<string>;
  fetchEvent: (eventId: string) => Promise<Event | null>;
  fetchUserEvents: () => Promise<void>;
  loading: boolean;
  error: string | null;
  events: Record<string, Event>;
}

const EventContext = createContext<EventContextType | null>(null);

export const useEvent = () => {
  const context = useContext(EventContext);
  if (!context) throw new Error('useEvent must be used within an EventProvider');
  return context;
};

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<Record<string, Event>>({});
  const { user } = useAuth();
  
  // Subscription management
  const unsubscribes = useRef<Record<string, () => void>>({});
  const lastFetch = useRef<Record<string, number>>({});
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      Object.values(unsubscribes.current).forEach(unsubscribe => unsubscribe());
    };
  }, []);

  const isCacheValid = useCallback((eventId: string) => {
    const lastFetchTime = lastFetch.current[eventId];
    return lastFetchTime && Date.now() - lastFetchTime < CACHE_DURATION;
  }, []);

  const createNewEvent = async (eventData: Omit<Event, 'id' | 'createdAt' | 'photos' | 'userId' | 'driveId'>) => {
    if (!user) {
      toast.error('Etkinlik oluşturmak için giriş yapmalısınız');
      throw new Error('User must be logged in');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Create event document
      const eventRef = await addDoc(collection(db, 'events'), {
        ...eventData,
        userId: user.uid,
        createdAt: serverTimestamp(),
        photos: [],
        driveId: '' // Will be updated after folder creation
      });

      // Create Drive folder
      try {
        const { folderId } = await createEventFolder(eventRef.id, eventData.name);
        await updateDoc(eventRef, { driveId: folderId });
      } catch (error) {
        console.error('Drive folder creation error:', error);
        // Continue even if folder creation fails - we can retry later
      }

      // Update local cache
      const newEvent: Event = {
        id: eventRef.id,
        ...eventData,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        photos: [],
        driveId: ''
      };
      
      setEvents(prev => ({ ...prev, [eventRef.id]: newEvent }));
      lastFetch.current[eventRef.id] = Date.now();

      return eventRef.id;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Etkinlik oluşturulamadı';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvent = useCallback(async (eventId: string): Promise<Event | null> => {
    // Return cached event if valid
    if (events[eventId] && isCacheValid(eventId)) {
      return events[eventId];
    }

    // Setup real-time listener if not exists
    if (!unsubscribes.current[eventId]) {
      const docRef = doc(db, 'events', eventId);
      unsubscribes.current[eventId] = onSnapshot(docRef, 
        (docSnap) => {
          if (docSnap.exists()) {
            const eventData = { id: docSnap.id, ...docSnap.data() } as Event;
            setEvents(prev => ({ ...prev, [eventId]: eventData }));
            lastFetch.current[eventId] = Date.now();
          }
        },
        (error) => {
          console.error('Event subscription error:', error);
          delete unsubscribes.current[eventId];
          delete lastFetch.current[eventId];
        }
      );
    }

    // Initial fetch if needed
    if (!events[eventId]) {
      try {
        const docRef = doc(db, 'events', eventId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const eventData = { id: docSnap.id, ...docSnap.data() } as Event;
          setEvents(prev => ({ ...prev, [eventId]: eventData }));
          lastFetch.current[eventId] = Date.now();
          return eventData;
        }
      } catch (error) {
        console.error('Event fetch error:', error);
        throw error;
      }
    }

    return events[eventId] || null;
  }, [events, isCacheValid]);

  const fetchUserEvents = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const q = query(
        collection(db, 'events'),
        where('userId', '==', user.uid),
        limit(50)
      );
      
      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);
      const newEvents: Record<string, Event> = {};

      querySnapshot.forEach(doc => {
        const eventData = doc.data() as Omit<Event, 'id'>;
        const event = { id: doc.id, ...eventData } as Event;
        
        // Create Drive folder if missing
        if (!event.driveId) {
          createEventFolder(doc.id, event.name)
            .then(({ folderId }) => {
              batch.update(doc.ref, { driveId: folderId });
            })
            .catch(console.error);
        }

        newEvents[doc.id] = event;
        lastFetch.current[doc.id] = Date.now();
      });

      // Commit any pending updates
      await batch.commit();

      setEvents(prev => ({ ...prev, ...newEvents }));
    } catch (error) {
      console.error('User events fetch error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return (
    <EventContext.Provider
      value={{
        createNewEvent,
        fetchEvent,
        fetchUserEvents,
        loading,
        error,
        events
      }}
    >
      {children}
    </EventContext.Provider>
  );
};