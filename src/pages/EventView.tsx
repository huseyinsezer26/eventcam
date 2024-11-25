import React, { useEffect, useState, useCallback } from 'react';
import { Share2, Download, QrCode } from 'lucide-react';
import QRCode from 'react-qr-code';
import { useParams } from 'react-router-dom';
import { useEvent } from '../contexts/EventContext';
import { Event } from '../types/event';
import toast from 'react-hot-toast';

const EventView = () => {
  const { id } = useParams<{ id: string }>();
  const { fetchEvent, events } = useEvent();
  const [loading, setLoading] = useState(true);

  // Get event from cache or fetch it
  const event = id ? events[id] : null;

  useEffect(() => {
    const loadEvent = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      // Skip loading if we already have the event in cache
      if (event) {
        setLoading(false);
        return;
      }

      try {
        await fetchEvent(id);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Etkinlik yüklenirken bir hata oluştu';
        console.error('Error loading event:', errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [id, fetchEvent, event]);

  const handleShare = useCallback(async () => {
    if (!event?.id) return;
    
    const uploadUrl = `${window.location.origin}/upload/${event.id}`;
    try {
      await navigator.clipboard.writeText(uploadUrl);
      toast.success('Link kopyalandı!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Link kopyalanırken bir hata oluştu';
      console.error('Error copying to clipboard:', errorMessage);
      toast.error(errorMessage);
    }
  }, [event?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-700">Etkinlik bulunamadı</h2>
      </div>
    );
  }

  const uploadUrl = `${window.location.origin}/upload/${event.id}`;
  const eventDate = new Date(event.date);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{event.name}</h1>
            <p className="text-gray-600 mt-2">
              {eventDate.toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
            <p className="text-gray-600">{event.location}</p>
          </div>
          <div className="flex space-x-4">
            <button 
              onClick={handleShare}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              <Share2 className="h-5 w-5" />
              <span>Paylaş</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
              <Download className="h-5 w-5" />
              <span>İndir</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">QR Kodu</h2>
          <div className="flex justify-center mb-4">
            <QRCode value={uploadUrl} size={200} />
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors mx-auto">
            <QrCode className="h-5 w-5" />
            <span>QR Kodunu İndir</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-semibold mb-4">Paylaşım Bilgileri</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Yükleme Linki
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={uploadUrl}
                  readOnly
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-l-lg bg-gray-50"
                />
                <button 
                  onClick={handleShare}
                  className="px-4 py-2 bg-primary text-white rounded-r-lg hover:bg-primary/90 transition-colors"
                >
                  Kopyala
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-xl font-semibold mb-6">Yüklenen Fotoğraflar</h2>
        {event.photos && event.photos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {event.photos.map((photo) => (
              <a
                key={photo.id}
                href={photo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="aspect-square rounded-lg overflow-hidden hover:opacity-75 transition-opacity"
              >
                <img
                  src={photo.url}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </a>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            Henüz fotoğraf yüklenmemiş
          </div>
        )}
      </div>
    </div>
  );
};

export default EventView;