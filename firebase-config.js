// Firebase Configuration for SLISR
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, getDocs, doc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA-REPLACE-WITH-YOUR-KEY", // REPLACE THIS!
    authDomain: "slisr-admin.firebaseapp.com",
    projectId: "slisr-admin",
    storageBucket: "slisr-admin.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcdef"
};

// Check if keys are still placeholders
if (firebaseConfig.apiKey.includes("REPLACE")) {
    console.warn("Firebase Setup Required: Please replace the placeholder keys in firebase-config.js with your actual Firebase Project keys.");
    
    // Optional: Show a small helpful banner if in development
    window.addEventListener('load', () => {
        const banner = document.createElement('div');
        banner.style.cssText = "position:fixed; bottom:0; left:0; width:100%; padding:10px; background:#f59e0b; color:#fff; text-align:center; z-index:100000; font-size:12px; font-weight:bold;";
        banner.innerHTML = "⚠️ Firebase Keys Required: Visit the dashboard setup guide to connect your backend.";
        document.body.appendChild(banner);
    });
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, getDocs, signInWithEmailAndPassword, onAuthStateChanged, signOut, doc, setDoc, deleteDoc };
