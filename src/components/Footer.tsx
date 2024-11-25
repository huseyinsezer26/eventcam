import React from 'react';
import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white shadow-lg mt-8">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="flex items-center space-x-1">
            <span>Sevgiyle yapıldı</span>
            <Heart className="h-4 w-4 text-red-500 fill-current" />
          </div>
          <div className="text-sm text-gray-600">
            © 2024 AnıKare. Tüm hakları saklıdır.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;