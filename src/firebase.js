import { initializeApp } from "firebase/app";

import {
  getAuth,
  GoogleAuthProvider,
} from "firebase/auth";

import {
  getFirestore,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCfRnFUbpcdAzJPyHEoyBve97s_HHIn428",
  authDomain: "studyhub-pro-17e79.firebaseapp.com",
  projectId: "studyhub-pro-17e79",
  storageBucket: "studyhub-pro-17e79.firebasestorage.app",
  messagingSenderId: "749981634857",
  appId: "1:749981634857:web:7dc96409524a9205916738",
  measurementId: "G-7L9RV3089G",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const provider =
  new GoogleAuthProvider();

export const db =
  getFirestore(app);

export default app;