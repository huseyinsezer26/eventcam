import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Çıkış yapılırken hata oluştu:', error);
    }
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-navy rounded-lg p-2">
              <Camera className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-navy">
              eventcam
            </span>
          </Link>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/create-event"
                  className="px-4 py-2 rounded-full bg-primary text-white font-medium hover:opacity-90 transition-opacity"
                >
                  Etkinlik Oluştur
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-navy hover:text-primary transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="px-4 py-2 rounded-full bg-primary text-white font-medium hover:opacity-90 transition-opacity"
              >
                Giriş Yap
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;