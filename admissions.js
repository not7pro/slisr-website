import { db, ref, onValue, query, orderByChild, push } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const feesContainer = document.getElementById('dynamicFeesCards');

    // Real-time listener for Tuition Fees
    function initFeesSync() {
        const q = query(ref(db, 'fees'), orderByChild('order'));
        
        onValue(q, (snapshot) => {
            if (!feesContainer) return;
            
            if (!snapshot.exists()) {
                renderFallbacks();
                return;
            }

            let html = '';
            let count = 0;
            snapshot.forEach((doc) => {
                const data = doc.val();
                const delay = count * 100;
                const isFeatured = data.grade.toLowerCase().includes('primary') || data.grade.toLowerCase().includes('middle');
                
                html += `
                    <div class="fee-card ${isFeatured ? 'featured' : ''}" data-aos="zoom-in" data-aos-delay="${delay}">
                        ${isFeatured ? '<div class="badge">Most Popular</div>' : ''}
                        <h3>${data.grade}</h3>
                        <div class="fee-amount">SAR ${data.tuition}<span>/year</span></div>
                        <ul class="fee-details">
                            <li>Admission Fee: SAR ${data.admission}</li>
                            <li>Annual Curriculum Fee</li>
                            <li>Resource Access Included</li>
                        </ul>
                    </div>
                `;
                count++;
            });
            feesContainer.innerHTML = html;
        });
    }

    function renderFallbacks() {
        // Just in case DB is empty, show original static info
        feesContainer.innerHTML = `
            <div class="fee-card featured" data-aos="zoom-in">
                <div class="badge">Default View</div>
                <h3>Standard Enrollment</h3>
                <div class="fee-amount">Contact Us<span>/year</span></div>
                <p>Please contact the admissions office for the latest fee schedule.</p>
            </div>
        `;
    }

    initFeesSync();

    // --- Application Form Logic ---
    const admissionsForm = document.getElementById('admissionsForm');
    const successMsg = document.getElementById('formSuccessMessage');

    if (admissionsForm) {
        admissionsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = admissionsForm.querySelector('button[type="submit"]');
            btn.textContent = 'Submitting...';
            btn.disabled = true;

            const formData = {
                parentName: document.getElementById('parentName').value,
                studentName: document.getElementById('studentName').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                grade: document.getElementById('studentGrade').value,
                prevSchool: document.getElementById('prevSchool').value,
                notes: document.getElementById('additionalNotes').value,
                timestamp: new Date().toISOString(),
                status: 'new'
            };

            try {
                // Prevent silent hanging on connection failures
                const pushPromise = push(ref(db, 'applications'), formData);
                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 7000));
                
                await Promise.race([pushPromise, timeoutPromise]);
                
                admissionsForm.reset();
                admissionsForm.style.display = 'none';
                successMsg.classList.remove('hidden');
                
                // Track system-level conversion
                if (!sessionStorage.getItem('applied_slisr_rtdb')) {
                    sessionStorage.setItem('applied_slisr_rtdb', 'true');
                }
            } catch (error) {
                console.error("Submission failed:", error);
                alert("Submission timed out. The school internet connection may be unavailable.");
                btn.textContent = 'Submit Official Application';
                btn.disabled = false;
            }
        });
    }
});
