import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, OAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const storage = getStorage(app);

export {
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
};
export type { User };

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
