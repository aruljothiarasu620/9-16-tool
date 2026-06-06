import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (serviceAccountJson) {
      const serviceAccount = JSON.parse(serviceAccountJson);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('✅ Firebase Admin SDK initialized with Service Account');
    } else {
      // Fallback for local development or default credentials
      admin.initializeApp({
        projectId: 'post-8eefb',
      });
      console.log('ℹ️ Firebase Admin SDK initialized with default projectId');
    }
  } catch (error) {
    console.warn('⚠️ Firebase Admin SDK failed to initialize. Checking fallback...', error);
    try {
      // Fallback to default local environment initialization
      admin.initializeApp();
    } catch (fallbackError) {
      console.error('❌ Firebase Admin SDK failed to initialize entirely:', fallbackError);
    }
  }
}

export const adminDb = admin.firestore();
export { admin };
