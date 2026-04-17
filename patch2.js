const fs = require('fs');

try {
    let content = fs.readFileSync('contact.js', 'utf8');
    
    const targetLF = `            try {
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
            }`;
            
    const targetCRLF = targetLF.replace(/\n/g, '\r\n');
    
    const replacement = `            try {
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
            }`;
            
    content = content.replace(targetLF, replacement);
    content = content.replace(targetCRLF, replacement);
    
    fs.writeFileSync('contact.js', content, 'utf8');
    console.log("contact.js patched successfully");
} catch (e) {
    console.error("Error patching contact.js", e);
}
