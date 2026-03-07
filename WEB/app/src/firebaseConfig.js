import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyBLPVtm9amu6JUtAYHlWpqN5VeTMnta6Ts",
    authDomain: "generador-socioeconomico.firebaseapp.com",
    projectId: "generador-socioeconomico",
    storageBucket: "generador-socioeconomico.firebasestorage.app",
    messagingSenderId: "968739948326",
    appId: "1:968739948326:web:ce1f7ae76d257e8c4563e7"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
