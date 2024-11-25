import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDoc, 
  doc,
  updateDoc,
  arrayUnion,
  serverTimestamp
} from 'firebase/firestore';
import { createEventFolder, uploadFile } from './api';
import { Event, Photo } from '../types/event';
import { useAuth } from '../contexts/AuthContext';

export const createEvent = async (eventData: Omit<Event, 'id' | 'createdAt' | 'photos' | 'userId' | 'driveId'>) => {
  try {
    // Önce Firestore'da temel etkinlik kaydını oluştur
    const docRef = await addDoc(collection(db, 'events'), {
      ...eventData,
      photos: [],
      createdAt: serverTimestamp()
    });

    // Google Drive'da klasör oluştur
    const { folderId } = await createEventFolder(docRef.id, eventData.name);

    // Firestore'daki kaydı Drive klasör ID'si ile güncelle
    await updateDoc(docRef, { driveId: folderId });
    
    return docRef.id;
  } catch (error) {
    console.error('Etkinlik oluşturma hatası:', error);
    throw error;
  }
};

export const uploadEventPhoto = async (
  eventId: string,
  file: File,
  uploadedBy?: string
): Promise<Photo> => {
  try {
    // Etkinliği getir ve Drive klasör ID'sini al
    const eventRef = doc(db, 'events', eventId);
    const eventSnap = await getDoc(eventRef);
    if (!eventSnap.exists()) throw new Error('Etkinlik bulunamadı');
    
    const { driveId } = eventSnap.data();
    if (!driveId) throw new Error('Drive klasörü bulunamadı');

    // Drive'a yükle
    const { fileId, webViewLink } = await uploadFile(driveId, file);
    
    const photo: Photo = {
      id: fileId,
      url: webViewLink,
      type: file.type.startsWith('image/') ? 'image' : 'video',
      uploadedBy,
      uploadedAt: serverTimestamp()
    };
    
    // Firestore'a fotoğraf referansını ekle
    await updateDoc(eventRef, {
      photos: arrayUnion(photo)
    });
    
    return photo;
  } catch (error) {
    console.error('Fotoğraf yükleme hatası:', error);
    throw error;
  }
};