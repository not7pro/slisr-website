const fs = require('fs');

try {
    // 1. Update firebase-config.js
    let configContent = `import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, push, onValue, remove, serverTimestamp, query, orderByChild } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
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
        alert("Firebase Rules Error: Your database is currently locked!\\n\\nTo fix this:\\n1. Go to Firebase Console -> Realtime Database.\\n2. Click the 'Rules' tab.\\n3. Change '.read' and '.write' to true.\\n4. Click 'Publish'.");
    }
});

export { db, auth, ref, set, push, onValue, remove, serverTimestamp, query, orderByChild, signInWithEmailAndPassword, onAuthStateChanged, signOut };`;
    fs.writeFileSync('firebase-config.js', configContent, 'utf8');

    // 2. Update contact.js
    let contactJS = fs.readFileSync('contact.js', 'utf8');
    contactJS = contactJS.replace(/import \{.*\} from '.\/firebase-config\.js';/, "import { db, ref, push, serverTimestamp } from './firebase-config.js';");
    contactJS = contactJS.replace(/addDoc\(collection\(db,\s*'messages'\),\s*formData\)/g, "push(ref(db, 'messages'), formData)");
    fs.writeFileSync('contact.js', contactJS, 'utf8');

    // 3. Update admin.js to RTDB
    let adminJS = fs.readFileSync('admin.js', 'utf8');
    adminJS = adminJS.replace(/import \{.*\} from '.\/firebase-config\.js';/, "import { db, ref, set, push, remove, onValue, query, orderByChild, auth, signOut, serverTimestamp } from './firebase-config.js';");
    
    // Messages
    adminJS = adminJS.replace(/const q = query\(collection\(db,\s*'messages'\),\s*orderBy\('timestamp',\s*'desc'\)\);/, "const q = query(ref(db, 'messages'), orderByChild('timestamp'));");
    adminJS = adminJS.replace(/onSnapshot\(q,\s*\(snapshot\)\s*=>\s*\{/, "onValue(q, (snapshot) => {");
    adminJS = adminJS.replace(/snapshot\.forEach\(\(doc\)\s*=>\s*\{[\s\S]*?\}\);/, "snapshot.forEach((childSnapshot) => {\n                currentMessages.push({ id: childSnapshot.key, ...childSnapshot.val() });\n            });\n            currentMessages.reverse();");
    adminJS = adminJS.replace(/msg\.timestamp \?\s*new Date\(msg\.timestamp\.seconds \* 1000\)/g, "msg.timestamp ? new Date(msg.timestamp)");
    adminJS = adminJS.replace(/deleteDoc\(doc\(db,\s*'messages',\s*id\)\)/g, "remove(ref(db, 'messages/' + id))");

    // Fees
    adminJS = adminJS.replace(/const q = query\(collection\(db,\s*'fees'\),\s*orderBy\('order',\s*'asc'\)\);/, "const q = query(ref(db, 'fees'), orderByChild('order'));");
    adminJS = adminJS.replace(/onSnapshot\(q,\s*\(snapshot\)\s*=>\s*\{/, "onValue(q, (snapshot) => {");
    adminJS = adminJS.replace(/snapshot\.forEach\(\(doc\)\s*=>\s*\{/, "snapshot.forEach((doc) => {\n                const data = doc.val();");
    adminJS = adminJS.replace(/doc\.id/g, "doc.key");
    adminJS = adminJS.replace(/setDoc\(doc\(db,\s*'fees',\s*id\),\s*data\)/g, "set(ref(db, 'fees/' + id), data)");
    adminJS = adminJS.replace(/addDoc\(collection\(db,\s*'fees'\),\s*data\)/g, "push(ref(db, 'fees'), data)");
    adminJS = adminJS.replace(/deleteDoc\(doc\(db,\s*'fees',\s*id\)\)/g, "remove(ref(db, 'fees/' + id))");

    // News
    adminJS = adminJS.replace(/onSnapshot\(collection\(db,\s*'news'\),\s*\(snapshot\)\s*=>\s*\{/, "onValue(ref(db, 'news'), (snapshot) => {\n");
    adminJS = adminJS.replace(/addDoc\(collection\(db,\s*'news'\),\s*data\)/g, "push(ref(db, 'news'), data)");
    adminJS = adminJS.replace(/deleteDoc\(doc\(db,\s*'news',\s*id\)\)/g, "remove(ref(db, 'news/' + id))");

    // Gallery
    adminJS = adminJS.replace(/onSnapshot\(collection\(db,\s*'gallery'\),\s*\(snapshot\)\s*=>\s*\{/, "onValue(ref(db, 'gallery'), (snapshot) => {\n");
    adminJS = adminJS.replace(/addDoc\(collection\(db,\s*'gallery'\),\s*\{/, "push(ref(db, 'gallery'), {");
    adminJS = adminJS.replace(/deleteDoc\(doc\(db,\s*'gallery',\s*id\)\)/g, "remove(ref(db, 'gallery/' + id))");

    fs.writeFileSync('admin.js', adminJS, 'utf8');

    // 4. Update gallery.js
    let galleryJS = fs.readFileSync('gallery.js', 'utf8');
    galleryJS = galleryJS.replace(/import \{.*\} from '.\/firebase-config\.js';/, "import { db, ref, onValue, query, orderByChild } from './firebase-config.js';");
    galleryJS = galleryJS.replace(/const q = query\(collection\(db,\s*'gallery'\),\s*orderBy\('timestamp',\s*'desc'\)\);/, "const q = query(ref(db, 'gallery'), orderByChild('timestamp'));");
    galleryJS = galleryJS.replace(/onSnapshot\(q,\s*\(snapshot\)\s*=>\s*\{/, "onValue(q, (snapshot) => {");
    galleryJS = galleryJS.replace(/if\s*\(snapshot\.empty\)/, "if (!snapshot.exists())");
    galleryJS = galleryJS.replace(/snapshot\.forEach\(\(doc\)\s*=>\s*\{[\s\S]*?const data = doc\.data\(\);/g, "const items = [];\n            snapshot.forEach((doc) => {\n                items.push(doc.val());\n            });\n            items.reverse().forEach((data) => {");
    fs.writeFileSync('gallery.js', galleryJS, 'utf8');
    
    // 5. Update admissions.js
    let admissionsJS = fs.readFileSync('admissions.js', 'utf8');
    admissionsJS = admissionsJS.replace(/import \{.*\} from '.\/firebase-config\.js';/, "import { db, ref, onValue, query, orderByChild } from './firebase-config.js';");
    admissionsJS = admissionsJS.replace(/const q = query\(collection\(db,\s*'fees'\),\s*orderBy\('order',\s*'asc'\)\);/, "const q = query(ref(db, 'fees'), orderByChild('order'));");
    admissionsJS = admissionsJS.replace(/onSnapshot\(q,\s*\(snapshot\)\s*=>\s*\{/, "onValue(q, (snapshot) => {");
    admissionsJS = admissionsJS.replace(/if\s*\(snapshot\.empty\)/, "if (!snapshot.exists())");
    admissionsJS = admissionsJS.replace(/snapshot\.forEach\(\(doc\)\s*=>\s*\{[\s\S]*?const f = doc\.data\(\);/g, "snapshot.forEach((doc) => {\n                const f = doc.val();");
    fs.writeFileSync('admissions.js', admissionsJS, 'utf8');

    // 6. Update news-events.js
    let newsEventsJS = fs.readFileSync('news-events.js', 'utf8');
    newsEventsJS = newsEventsJS.replace(/import \{.*\} from '.\/firebase-config\.js';/, "import { db, ref, onValue, query, orderByChild } from './firebase-config.js';");
    newsEventsJS = newsEventsJS.replace(/const q = query\(collection\(db,\s*'news'\),\s*orderBy\('timestamp',\s*'desc'\)\);/, "const q = query(ref(db, 'news'), orderByChild('timestamp'));");
    newsEventsJS = newsEventsJS.replace(/onSnapshot\(q,\s*\(snapshot\)\s*=>\s*\{/, "onValue(q, (snapshot) => {");
    newsEventsJS = newsEventsJS.replace(/if\s*\(snapshot\.empty\)/, "if (!snapshot.exists())");
    newsEventsJS = newsEventsJS.replace(/snapshot\.forEach\(\(doc\)\s*=>\s*\{[\s\S]*?const n = doc\.data\(\);/g, "const items = [];\n            snapshot.forEach((doc) => {\n                items.push(doc.val());\n            });\n            items.reverse().forEach((n) => {");
    newsEventsJS = newsEventsJS.replace(/n\.timestamp \?\s*new Date\(n\.timestamp\.seconds \* 1000\)/g, "n.timestamp ? new Date(n.timestamp)");
    fs.writeFileSync('news-events.js', newsEventsJS, 'utf8');

    console.log("Migration complete.");
} catch (e) {
    console.error("Migration error:", e);
}
