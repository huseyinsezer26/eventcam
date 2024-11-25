import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  RulesTestContext
} from '@firebase/rules-unit-testing';
import { doc, setDoc, getDoc } from 'firebase/firestore';

let testEnv: RulesTestEnvironment;

export const setupTestEnvironment = async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-eventcam',
    firestore: {
      host: 'localhost',
      port: 8080,
    },
  });

  return testEnv;
};

export const getTestFirestore = (auth?: { uid: string }) => {
  return testEnv.authenticatedContext(auth?.uid || 'anonymous').firestore();
};

// Initialize the test environment
setupTestEnvironment().catch(console.error);