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
                // Add to Firestore
                await addDoc(collection(db, 'messages'), formData);
                
                // Show Success
                contactForm.classList.add('hidden');
                successMsg.classList.remove('hidden');
                
                // Optional: Smooth scroll to success message
                successMsg.scrollIntoView({ behavior: 'smooth' });
            } catch (error) {
                console.error("Error adding document: ", error);
                alert("Sorry, there was an error sending your message. Please try again later.");
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
});
