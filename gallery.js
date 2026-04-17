import { db, ref, onValue, query, orderByChild } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const galleryGrid = document.getElementById('galleryGrid');

    function initGallerySync() {
        const q = query(ref(db, 'gallery'), orderByChild('timestamp'));
        
        onValue(q, (snapshot) => {
            if (!galleryGrid) return;

            if (!snapshot.exists()) {
                galleryGrid.innerHTML = '<div class="gallery-empty"><p>No photos available in the gallery yet.</p></div>';
                return;
            }

            let html = '';
            const items = [];
            snapshot.forEach((doc) => {
                items.push(doc.val());
            });
            items.reverse().forEach((data) => {
                html += `
                    <div class="gallery-item" data-aos="fade-up">
                        <div class="gallery-image-wrapper">
                            <img src="${data.url}" alt="School Photo" loading="lazy">
                        </div>
                    </div>
                `;
            });
            galleryGrid.innerHTML = html;
        });
    }

    initGallerySync();
});
