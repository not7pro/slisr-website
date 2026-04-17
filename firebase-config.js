// Firebase Configuration for SLISR - CONNECTED
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, getDocs, doc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCws78LEwQXJe_Ktd-UYNXj15S0hMMg7xQ",
    authDomain: "slisr-official.firebaseapp.com",
    projectId: "slisr-official",
    storageBucket: "slisr-official.firebasestorage.app",
    messagingSenderId: "1000091265027",
    appId: "1:1000091265027:web:a85999d57d0576539a0636"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, getDocs, signInWithEmailAndPassword, onAuthStateChanged, signOut, doc, setDoc, deleteDoc };
