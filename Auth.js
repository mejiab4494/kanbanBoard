import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ─── YOUR CONFIG (from Firebase Console → Project Settings → Your apps) ──────
const firebaseConfig = {
  apiKey: "AIzaSyCypWRmb-nzFxAUb7FqSHL-895QxUhYDpg",
  authDomain: "kanbanboard-debe3.firebaseapp.com",
  projectId: "kanbanboard-debe3",
  storageBucket: "kanbanboard-debe3.firebasestorage.app",
  messagingSenderId: "5301770442",
  appId: "1:5301770442:web:e071ebc073496cc02d3c33",
  measurementId: "G-5J8VWTK5Z9"
};

const app      = initializeApp(firebaseConfig);
const auth     = getAuth(app);
const provider = new GoogleAuthProvider();

export function getApp() { return app; }

export function getCurrentUser() {
  return auth.currentUser;
}

export function signIn() {
  return signInWithPopup(auth, provider);
}

export function signOutUser() {
  return signOut(auth);
}

/**
 * Calls `callback(user)` immediately with the current user (or null),
 * then again any time auth state changes.
 * Returns an unsubscribe function.
 */
export function onUserChange(callback) {
  return onAuthStateChanged(auth, callback);
}