import { db, collection, addDoc, serverTimestamp } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    const successMsg = document.getElementById('contactSuccess');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = contactForm.querySelector('.submit-btn');
            const originalText = submitBtn.textContent;
            
            // UI Feedback
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            const formData = {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                email: document.getElementById('email').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value,
                timestamp: serverTimestamp(),
                status: 'new'
            };

            try {
                // Add to Firestore with a 7-second timeout to prevent infinite hanging
                const addPromise = addDoc(collection(db, 'messages'), formData);
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error("Timeout: Database unreachable")), 7000)
                );
                
                await Promise.race([addPromise, timeoutPromise]);
                
                // Show Success
                contactForm.classList.add('hidden');
                successMsg.classList.remove('hidden');
                
                // Optional: Smooth scroll to success message
                successMsg.scrollIntoView({ behavior: 'smooth' });
            } catch (error) {
                console.error("Error adding document: ", error);
                
                let errorMsg = "Sorry, there was an error sending your message. Please try again later.";
                if (error.message.includes("Timeout")) {
                    errorMsg = "Connection timeout. Your project's Firestore Database might not be fully created yet. Please check your Firebase Console.";
                } else if (error.message.toLowerCase().includes("permission")) {
                    errorMsg = "Permission denied. Please ensure your Firestore Database rules are set to Test Mode.";
                }
                
                alert(errorMsg);
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
});
