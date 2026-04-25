import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCXuj6Y0Mih2mfBdedjyuxjXeU5iN5XL64",
  authDomain: "post-8eefb.firebaseapp.com",
  projectId: "post-8eefb",
  storageBucket: "post-8eefb.firebasestorage.app",
  messagingSenderId: "721588949261",
  appId: "1:721588949261:web:19513589915fa98a5d2044",
  measurementId: "G-1VN02188NN"
};

// Initialize Firebase securely (prevents re-initialization errors in Next.js)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
    throw error;
  }
};
