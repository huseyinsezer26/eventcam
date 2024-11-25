import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));

app.use(express.json());

// Google Drive API yapılandırması
const auth = new GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  },
  scopes: ['https://www.googleapis.com/auth/drive.file']
});

const drive = google.drive({ version: 'v3', auth });

// Etkinlik klasörü oluşturma
app.post('/events/folder', async (req, res) => {
  try {
    const { eventId, eventName } = req.body;

    const folderMetadata = {
      name: `${eventName} (${eventId})`,
      mimeType: 'application/vnd.google-apps.folder'
    };

    const folder = await drive.files.create({
      resource: folderMetadata,
      fields: 'id,webViewLink'
    });

    // Klasörü herkese açık yap
    await drive.permissions.create({
      fileId: folder.data.id,
      requestBody: {
        role: 'writer',
        type: 'anyone'
      }
    });

    console.log('Drive klasörü oluşturuldu:', {
      id: folder.data.id,
      link: folder.data.webViewLink
    });

    res.json({ folderId: folder.data.id });
  } catch (error) {
    console.error('Klasör oluşturma hatası:', error);
    res.status(500).json({ error: 'Klasör oluşturulamadı' });
  }
});

// Dosya yükleme
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { folderId } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'Dosya bulunamadı' });
    }

    const fileMetadata = {
      name: file.originalname,
      parents: [folderId]
    };

    const media = {
      mimeType: file.mimetype,
      body: file.buffer
    };

    const uploadedFile = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id,webViewLink'
    });

    // Dosyayı herkese açık yap (sadece görüntüleme)
    await drive.permissions.create({
      fileId: uploadedFile.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });

    console.log('Dosya yüklendi:', {
      id: uploadedFile.data.id,
      link: uploadedFile.data.webViewLink
    });

    res.json({
      fileId: uploadedFile.data.id,
      webViewLink: uploadedFile.data.webViewLink
    });
  } catch (error) {
    console.error('Dosya yükleme hatası:', error);
    res.status(500).json({ error: 'Dosya yüklenemedi' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});