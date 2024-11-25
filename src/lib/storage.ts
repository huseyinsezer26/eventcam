import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

export const uploadFile = async (
  eventId: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ fileId: string; downloadUrl: string }> => {
  try {
    const fileId = uuidv4();
    const fileExtension = file.name.split('.').pop();
    const path = `events/${eventId}/${fileId}.${fileExtension}`;
    const storageRef = ref(storage, path);
    
    // Upload file
    await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadUrl = await getDownloadURL(storageRef);

    return {
      fileId,
      downloadUrl
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Dosya yüklenemedi');
  }
};