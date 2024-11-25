import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Share2, Download, Calendar } from 'lucide-react';
import { useEvent } from '../contexts/EventContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Home = () => {
  const { user } = useAuth();
  const { fetchUserEvents, events } = useEvent();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadEvents = async () => {
      if (user) {
        setLoading(true);
        try {
          await fetchUserEvents();
        } catch (error) {
          toast.error('Etkinlikler yüklenirken bir hata oluştu');
        } finally {
          setLoading(false);
        }
      }
    };

    loadEvents();
  }, [user, fetchUserEvents]);

  const userEvents = Object.values(events).filter(event => event.userId === user?.uid);

  return (
    <div className="space-y-16">
      <section className="text-center space-y-6 py-16">
        <h1 className="text-5xl font-bold text-navy">
          Özel Anlarınızı Birlikte Ölümsüzleştirin
        </h1>
        <p className="text-xl text-navy/80 max-w-2xl mx-auto">
          Düğün, nişan, doğum günü... Tüm özel anlarınızda çekilen fotoğrafları tek bir yerde toplayın.
          Misafirlerinizle anında paylaşın.
        </p>
        <Link
          to="/create-event"
          className="inline-block px-8 py-4 rounded-full bg-primary text-white font-medium hover:opacity-90 transition-opacity text-lg"
        >
          Hemen Başlayın
        </Link>
      </section>

      {user && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-navy">Etkinlikleriniz</h2>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            </div>
          ) : userEvents.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userEvents.map((event) => (
                <Link
                  key={event.id}
                  to={`/event/${event.id}`}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-navy">{event.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(event.date).toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-gray-600">{event.location}</p>
                    </div>
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between items-center text-sm">
                    <span className="text-gray-600">
                      {event.photos?.length || 0} fotoğraf
                    </span>
                    <span className="text-primary font-medium">Detayları Gör →</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-lg">
              <div className="mb-4">
                <Camera className="h-12 w-12 text-gray-400 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Henüz etkinlik yok</h3>
              <p className="mt-1 text-gray-500">İlk etkinliğinizi oluşturmak için başlayın</p>
              <Link
                to="/create-event"
                className="mt-4 inline-block px-6 py-2 rounded-full bg-primary text-white font-medium hover:opacity-90 transition-opacity"
              >
                Etkinlik Oluştur
              </Link>
            </div>
          )}
        </section>
      )}

      <section className="grid md:grid-cols-3 gap-8">
        <FeatureCard
          icon={<Camera className="h-8 w-8" />}
          title="Kolay Paylaşım"
          description="QR kod ile anında fotoğraf ve video yükleme imkanı"
        />
        <FeatureCard
          icon={<Share2 className="h-8 w-8" />}
          title="Tek Noktada Toplama"
          description="Tüm misafirlerin çektiği anılar tek bir yerde"
        />
        <FeatureCard
          icon={<Download className="h-8 w-8" />}
          title="Güvenli Saklama"
          description="Sınırsız süre boyunca anılarınızı güvenle saklayın"
        />
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg text-center space-y-4">
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-navy">{title}</h3>
    <p className="text-navy/70">{description}</p>
  </div>
);

export default Home;