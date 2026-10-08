import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBZV2ozgl0xkr4hCK1kDmWt6lyunTPn8_c",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "gen-lang-client-0727717589.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "gen-lang-client-0727717589",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "gen-lang-client-0727717589.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "748604950884",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:748604950884:web:00164d4bbd885b52ab9271",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app, "ai-studio-secretpresso-3e6fa315-02aa-4202-9c3e-7ec8af30fa5a");
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
