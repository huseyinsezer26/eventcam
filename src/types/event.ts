export interface Event {
  id: string;
  name: string;
  type: string;
  date: string;
  location: string;
  guestCount: number;
  userId: string;
  driveId: string; // Google Drive folder ID
  createdAt: string | Date;
  photos: Photo[];
}

export interface Photo {
  id: string;
  url: string;
  type: 'image' | 'video';
  uploadedBy?: string;
  uploadedAt: string | Date;
}