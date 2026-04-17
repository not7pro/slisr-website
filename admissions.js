import { db, ref, onValue, query, orderByChild } from './firebase-config.js';

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
                const data = doc.data();
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
});
