import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { google } from 'googleapis';

dotenv.config();

const app = express();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// CORS configuration with all current origins
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://sb1snhnyr-2naz--5173--d3acb9e1.local-credentialless.webcontainer.io',
    'https://stackblitz.com',
    /\.stackblitz\.io$/,
    /\.webcontainer\.io$/
  ],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json());

// Basic logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Initialize Google Drive API
const initializeDrive = () => {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      },
      scopes: ['https://www.googleapis.com/auth/drive.file']
    });

    return google.drive({ version: 'v3', auth });
  } catch (error) {
    console.error('Drive initialization error:', error);
    throw error;
  }
};

let drive;
try {
  drive = initializeDrive();
  console.log('Google Drive API initialized successfully');
} catch (error) {
  console.error('Failed to initialize Google Drive API:', error);
}

// Create event folder
app.post('/events/folder', async (req, res) => {
  console.log('Received folder creation request:', req.body);

  if (!drive) {
    return res.status(500).json({ 
      error: 'Drive API not initialized'
    });
  }

  try {
    const { eventId, eventName } = req.body;

    if (!eventId || !eventName) {
      return res.status(400).json({ 
        error: 'Event ID and name are required',
        received: { eventId, eventName }
      });
    }

    const folderMetadata = {
      name: `${eventName} (${eventId})`,
      mimeType: 'application/vnd.google-apps.folder'
    };

    const folder = await drive.files.create({
      requestBody: folderMetadata,
      fields: 'id,webViewLink'
    });

    await drive.permissions.create({
      fileId: folder.data.id,
      requestBody: {
        role: 'writer',
        type: 'anyone'
      }
    });

    console.log('Drive folder created successfully:', {
      id: folder.data.id,
      name: folderMetadata.name
    });

    res.json({ 
      folderId: folder.data.id,
      success: true 
    });
  } catch (error) {
    console.error('Folder creation error:', error);
    res.status(500).json({ 
      error: 'Klasör oluşturulamadı',
      details: error.message 
    });
  }
});

// Upload file endpoint
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!drive) {
    return res.status(500).json({ 
      error: 'Drive API not initialized'
    });
  }

  try {
    const { folderId } = req.body;
    const file = req.file;

    if (!file || !folderId) {
      return res.status(400).json({ 
        error: 'File and folder ID are required'
      });
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
      requestBody: fileMetadata,
      media: media,
      fields: 'id,webViewLink'
    });

    await drive.permissions.create({
      fileId: uploadedFile.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });

    res.json({
      fileId: uploadedFile.data.id,
      webViewLink: uploadedFile.data.webViewLink,
      success: true
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ 
      error: 'Dosya yüklenemedi',
      details: error.message 
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
=========================================
  EventCam API Server
=========================================
  Status: Running
  Port: ${PORT}
  CORS Origins: Enabled for localhost & StackBlitz
  Drive API: ${drive ? 'Initialized' : 'Not Initialized'}
=========================================
`);
});