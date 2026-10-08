import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForSecretpressoDev12345",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "secretpresso.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "secretpresso-app",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "secretpresso-app.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1234567890:web:abcdef",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export async function uploadToFirebaseStorage(
  folder: string,
  file: File,
  customName?: string
): Promise<{ url: string; path: string }> {
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const cleanBaseName = (customName || file.name)
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .substring(0, 40);
  const filePath = `${folder}/${Date.now()}_${cleanBaseName}.${fileExt}`;
  const storageRef = ref(storage, filePath);

  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return { url, path: filePath };
}
