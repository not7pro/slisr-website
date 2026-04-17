import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, push, onValue, remove, serverTimestamp, query, orderByChild, runTransaction } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCws78LEwQXJe_Ktd-UYNXj15S0hMMg7xQ",
    authDomain: "slisr-official.firebaseapp.com",
    databaseURL: "https://slisr-official-default-rtdb.firebaseio.com",
    projectId: "slisr-official",
    storageBucket: "slisr-official.firebasestorage.app",
    messagingSenderId: "1000091265027",
    appId: "1:1000091265027:web:a85999d57d0576539a0636"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

window.addEventListener('unhandledrejection', function(event) {
    const msg = event.reason && event.reason.message ? event.reason.message.toLowerCase() : "";
    const code = event.reason && event.reason.code ? event.reason.code.toLowerCase() : "";
    if (msg.includes("permission") || msg.includes("authorized") || code.includes("permission") || msg.includes("client is offline")) {
        alert("Firebase Rules Error: Your database is currently locked!\n\nTo fix this:\n1. Go to Firebase Console -> Realtime Database.\n2. Click the 'Rules' tab.\n3. Change '.read' and '.write' to true.\n4. Click 'Publish'.");
    }
});

export { db, auth, ref, set, push, onValue, remove, serverTimestamp, query, orderByChild, runTransaction, signInWithEmailAndPassword, onAuthStateChanged, signOut };