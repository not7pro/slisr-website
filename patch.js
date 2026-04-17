const fs = require('fs');

// Patch contact.html
try {
    let content = fs.readFileSync('contact.html', 'utf8');
    const badScriptLF = `    <script>
        document.getElementById('contactForm').addEventListener('submit', function(e) {
            e.preventDefault();
            this.style.display = 'none';
            document.getElementById('contactSuccess').classList.remove('hidden');
        });
    </script>`;
    const badScriptCRLF = badScriptLF.replace(/\n/g, '\r\n');
    
    content = content.replace(badScriptLF, '    <!-- Handled dynamically by contact.js -->');
    content = content.replace(badScriptCRLF, '    <!-- Handled dynamically by contact.js -->');
    
    fs.writeFileSync('contact.html', content, 'utf8');
    console.log("contact.html patched successfully");
} catch (e) {
    console.error("Error patching contact.html", e);
}

// Patch firebase-config.js
try {
    let content = fs.readFileSync('firebase-config.js', 'utf8');
    const targetLF = `export { db, auth, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, getDocs, signInWithEmailAndPassword, onAuthStateChanged, signOut, doc, setDoc, deleteDoc };`;
    const targetCRLF = targetLF.replace(/\n/g, '\r\n');
    
    const replacement = `
window.addEventListener('unhandledrejection', function(event) {
    const msg = event.reason && event.reason.message ? event.reason.message.toLowerCase() : "";
    const code = event.reason && event.reason.code ? event.reason.code.toLowerCase() : "";
    if (msg.includes("permission") || msg.includes("authorized") || code.includes("permission")) {
        alert("Firebase Rules Error: Your database is blocking access!\\n\\nTo fix this:\\n1. Go to Firebase Console -> Firestore Database.\\n2. Click the 'Rules' tab.\\n3. Change the rule to:\\n   allow read, write: if true;\\n4. Click 'Publish'.");
    }
});

export { db, auth, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, getDocs, signInWithEmailAndPassword, onAuthStateChanged, signOut, doc, setDoc, deleteDoc };`;
    
    content = content.replace(targetLF, replacement);
    content = content.replace(targetCRLF, replacement);
    
    fs.writeFileSync('firebase-config.js', content, 'utf8');
    console.log("firebase-config.js patched successfully");
} catch (e) {
    console.error("Error patching firebase-config.js", e);
}
