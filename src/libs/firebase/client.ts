import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const config = {
    apiKey: import.meta.env.VITE_PUBLIC_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_PUBLIC_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_PUBLIC_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const app =
    getApps().length === 0 ? initializeApp(config) : getApps()[0];

export const auth = getAuth(app);

export const database = getDatabase(app);

export const storage = getStorage(app);

export const firestore = getFirestore(app);
