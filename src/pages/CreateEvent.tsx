import React, { useState } from 'react';
import { Calendar, Users, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEvent } from '../contexts/EventContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const CreateEvent = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { createNewEvent, loading } = useEvent();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    date: '',
    location: '',
    guestCount: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateStep = () => {
    switch (step) {
      case 1:
        if (!formData.name || !formData.type) {
          toast.error('Lütfen tüm alanları doldurun');
          return false;
        }
        break;
      case 2:
        if (!formData.date || !formData.location) {
          toast.error('Lütfen tüm alanları doldurun');
          return false;
        }
        break;
      case 3:
        if (!formData.guestCount || parseInt(formData.guestCount) < 1) {
          toast.error('Lütfen geçerli bir misafir sayısı girin');
          return false;
        }
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Etkinlik oluşturmak için giriş yapmalısınız');
      navigate('/auth');
      return;
    }

    if (!validateStep()) {
      return;
    }

    try {
      const eventId = await createNewEvent({
        name: formData.name,
        type: formData.type,
        date: formData.date,
        location: formData.location,
        guestCount: parseInt(formData.guestCount)
      });
      
      toast.success('Etkinlik başarıyla oluşturuldu!');
      navigate(`/event/${eventId}`);
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Etkinlik oluşturulurken bir hata oluştu');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-between items-center mb-8">
          {[
            { icon: Calendar, label: 'Etkinlik Bilgileri' },
            { icon: MapPin, label: 'Tarih ve Konum' },
            { icon: Users, label: 'Misafir Bilgileri' },
          ].map((item, index) => {
            const Icon = item.icon;
            const isActive = step === index + 1;
            const isCompleted = step > index + 1;
            
            return (
              <div
                key={index}
                className={`flex flex-col items-center ${
                  isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    isActive ? 'bg-primary/10' : isCompleted ? 'bg-green-100' : 'bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Etkinlik Adı
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Etkinlik Türü
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                >
                  <option value="">Seçiniz</option>
                  <option value="wedding">Düğün</option>
                  <option value="engagement">Nişan</option>
                  <option value="birthday">Doğum Günü</option>
                  <option value="other">Diğer</option>
                </select>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Etkinlik Tarihi
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Etkinlik Yeri
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
            </>
          )}

          {step === 3 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tahmini Misafir Sayısı
              </label>
              <input
                type="number"
                name="guestCount"
                value={formData.guestCount}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
                min="1"
              />
            </div>
          )}

          <div className="flex justify-between pt-6">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-6 py-2 rounded-full border-2 border-primary text-primary font-medium hover:bg-primary/10 transition-colors"
                disabled={loading}
              >
                Geri
              </button>
            )}
            
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2 rounded-full bg-primary text-white font-medium hover:opacity-90 transition-opacity ml-auto"
                disabled={loading}
              >
                İleri
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-2 rounded-full bg-primary text-white font-medium hover:opacity-90 transition-opacity ml-auto disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Oluşturuluyor...' : 'Etkinlik Oluştur'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;