import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import express from 'express';

const app = express();
const port = 4000;

// Initialize the test environment
const setupEmulator = async () => {
  try {
    const testEnv = await initializeTestEnvironment({
      projectId: 'demo-eventcam',
      firestore: {
        host: 'localhost',
        port: 8080,
      },
    });

    console.log('Firestore emulator is running on port 8080');
    console.log('Emulator UI is available at http://localhost:4000');

    // Basic UI for viewing emulator status
    app.get('/', (req, res) => {
      res.send(`
        <html>
          <head>
            <title>Firestore Emulator UI</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .status { padding: 20px; background: #e0f7fa; border-radius: 8px; }
            </style>
          </head>
          <body>
            <h1>Firestore Emulator Status</h1>
            <div class="status">
              <p>✅ Emulator is running</p>
              <p>Project ID: demo-eventcam</p>
              <p>Firestore Port: 8080</p>
            </div>
          </body>
        </html>
      `);
    });

    app.listen(port, () => {
      console.log(`Emulator UI server running at http://localhost:${port}`);
    });

    return testEnv;
  } catch (error) {
    console.error('Error setting up emulator:', error);
    process.exit(1);
  }
};

setupEmulator();