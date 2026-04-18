// seed_fees.js — Populate Firebase with default school fee structure
// Run once: node seed_fees.js

const { initializeApp } = require('firebase/app');
const { getDatabase, ref, push, set, get } = require('firebase/database');

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

const fees = [
    { grade: 'Kindergarten (KG)',    admission: '2,500',  tuition: '8,500',  order: 0 },
    { grade: 'Primary (Grades 1–5)', admission: '3,000',  tuition: '10,500', order: 1 },
    { grade: 'Middle (Grades 6–8)',  admission: '3,500',  tuition: '12,000', order: 2 },
    { grade: 'High / O-Level (9–10)',admission: '4,000',  tuition: '14,500', order: 3 },
    { grade: 'A-Level (11–12)',      admission: '4,500',  tuition: '17,000', order: 4 },
];

async function seedFees() {
    const feesRef = ref(db, 'fees');
    const snapshot = await get(feesRef);

    if (snapshot.exists()) {
        console.log('✓ Fees already exist in database — skipping seed.');
        process.exit(0);
    }

    for (const fee of fees) {
        await push(feesRef, fee);
        console.log(`Seeded: ${fee.grade}`);
    }
    console.log('\n✅ All fee records seeded successfully!');
    process.exit(0);
}

seedFees().catch(err => {
    console.error('Seed failed:', err.message);
    process.exit(1);
});
