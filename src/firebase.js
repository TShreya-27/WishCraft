import { initializeApp }
from 'firebase/app';

// AUTH

import {
  getAuth,
  GoogleAuthProvider
} from 'firebase/auth';

// FIRESTORE

import {
  getFirestore
} from 'firebase/firestore';

// STORAGE

import {
  getStorage
} from 'firebase/storage';

// =========================================
// FIREBASE CONFIG
// =========================================

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// =========================================
// INITIALIZE
// =========================================

const app =
  initializeApp(firebaseConfig);

// =========================================
// AUTH
// =========================================

export const auth =
  getAuth(app);

export const googleProvider =
  new GoogleAuthProvider();

// =========================================
// FIRESTORE
// =========================================

export const db =
  getFirestore(app);


// =========================================
// STORAGE
// =========================================

export const storage =
  getStorage(app);
