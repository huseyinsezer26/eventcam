import axios from 'axios';

// Production ve development API URL'lerini ayarla
const API_URL = import.meta.env.PROD 
  ? 'https://eventcam-api.onrender.com'  // Production API URL
  : 'http://localhost:3000';             // Development API URL

// API istemcisi oluştur
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for logging
api.interceptors.request.use(
  config => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  error => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging
api.interceptors.response.use(
  response => {
    console.log(`API Response: ${response.status}`);
    return response;
  },
  error => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Health check endpoint
export const checkHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data.status === 'ok';
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
};

// Event folder creation
export const createEventFolder = async (eventId: string, eventName: string): Promise<{ folderId: string }> => {
  try {
    const response = await api.post('/events/folder', { eventId, eventName });
    
    if (!response.data.folderId) {
      throw new Error('No folder ID received from server');
    }
    
    return { folderId: response.data.folderId };
  } catch (error) {
    console.error('Drive folder creation error:', error);
    throw error;
  }
};

// File upload with progress tracking
export const uploadFile = async (
  folderId: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ fileId: string; webViewLink: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folderId', folderId);

  try {
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          onProgress(progress);
        }
      },
    });

    return response.data;
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
};