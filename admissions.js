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
            animateFeeCards();
        });
    }

    function buildFeeCard(grade, tuition, admission, featured = false, delay = 0) {
        return `
            <div class="fee-card ${featured ? 'featured' : ''}" style="opacity:0;transform:scale(0.9);transition:all 0.5s ease ${delay}ms;">
                ${featured ? '<div class="badge">Most Popular</div>' : ''}
                <h3>${grade}</h3>
                <div class="fee-amount">SAR ${tuition}<span>/year</span></div>
                <ul class="fee-details">
                    <li>Admission Fee: SAR ${admission}</li>
                    <li>Annual Curriculum Fee</li>
                    <li>Resource Access Included</li>
                    <li>Pearson Edexcel Certified</li>
                </ul>
                <a href="enroll.html" style="display:block;margin-top:20px;background:#2563eb;color:#fff;padding:12px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;text-align:center;">Apply Now →</a>
            </div>`;
    }

    function animateFeeCards() {
        document.querySelectorAll('#dynamicFeesCards .fee-card').forEach(card => {
            const obs = new IntersectionObserver(entries => {
                entries.forEach(e => {
                    if (e.isIntersecting) {
                        e.target.style.opacity = '1';
                        e.target.style.transform = e.target.classList.contains('featured') ? 'scale(1.05)' : 'scale(1)';
                        obs.unobserve(e.target);
                    }
                });
            }, { threshold: 0.1 });
            obs.observe(card);
        });
    }

    function renderFallbacks() {
        feesContainer.innerHTML =
            buildFeeCard('Kindergarten (KG)',          '8,500',  '2,500', false, 0)  +
            buildFeeCard('Primary School (Grades 1–5)','10,500', '3,000', true,  100) +
            buildFeeCard('Middle School (Grades 6–8)', '12,000', '3,500', true,  200) +
            buildFeeCard('O-Level (Grades 9–10)',      '14,500', '4,000', false, 300) +
            buildFeeCard('A-Level (Grades 11–12)',     '17,000', '4,500', false, 400);
        animateFeeCards();
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
