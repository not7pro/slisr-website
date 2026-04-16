// Firebase Configuration for SLISR
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Your web app's Firebase configuration
// NOTE: Replace these with your actual Firebase project keys
const firebaseConfig = {
    apiKey: "AIzaSyA-REPLACE-WITH-YOUR-KEY",
    authDomain: "slisr-admin.firebaseapp.com",
    projectId: "slisr-admin",
    storageBucket: "slisr-admin.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcdef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, getDocs, signInWithEmailAndPassword, onAuthStateChanged, signOut };
