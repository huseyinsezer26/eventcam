import React, { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Upload as UploadIcon, Image, Film } from 'lucide-react';
import { uploadEventPhoto } from '../lib/events';
import toast from 'react-hot-toast';

const Upload = () => {
  const { id: eventId } = useParams<{ id: string }>();
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  }, []);

  const handleUpload = async () => {
    if (!eventId || files.length === 0) return;
    setUploading(true);

    try {
      for (const file of files) {
        try {
          setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
          await uploadEventPhoto(eventId, file);
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          toast.error(`${file.name} yüklenirken hata oluştu`);
        }
      }
      
      toast.success('Fotoğraflar başarıyla yüklendi!');
      setFiles([]);
      setUploadProgress({});
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Dosyalar yüklenirken bir hata oluştu');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Fotoğraf ve Video Yükle</h1>
        <p className="text-gray-600 mt-2">
          Etkinlikten çektiğiniz anıları buraya yükleyebilirsiniz
        </p>
      </div>

      <div
        className={`border-2 border-dashed rounded-2xl p-8 text-center ${
          dragActive ? 'border-purple-600 bg-purple-50' : 'border-gray-300'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 text-purple-600">
            <UploadIcon className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium">
              Fotoğraf ve videoları sürükleyip bırakın
            </p>
            <p className="text-gray-500">veya</p>
            <label className="inline-block px-6 py-2 rounded-full bg-purple-600 text-white cursor-pointer hover:bg-purple-700 transition-colors">
              Dosya Seç
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
                onChange={handleChange}
                disabled={uploading}
              />
            </label>
          </div>
          <p className="text-sm text-gray-500">
            Maksimum dosya boyutu: 50MB
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Yüklenecek Dosyalar</h2>
          <div className="space-y-3">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {file.type.startsWith('image/') ? (
                    <Image className="h-5 w-5 text-gray-500" />
                  ) : (
                    <Film className="h-5 w-5 text-gray-500" />
                  )}
                  <span className="text-sm text-gray-700">{file.name}</span>
                </div>
                {uploadProgress[file.name] ? (
                  <div className="w-24">
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-2 bg-purple-600 rounded-full"
                        style={{ width: `${uploadProgress[file.name]}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setFiles(files.filter((_, i) => i !== index))}
                    className="text-red-500 hover:text-red-700"
                    disabled={uploading}
                  >
                    Kaldır
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="mt-6">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {uploading ? 'Yükleniyor...' : 'Yüklemeyi Başlat'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;