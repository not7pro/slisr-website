import { db, collection, onSnapshot, query, orderBy } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const galleryGrid = document.getElementById('galleryGrid');

    function initGallerySync() {
        const q = query(collection(db, 'gallery'), orderBy('timestamp', 'desc'));
        
        onSnapshot(q, (snapshot) => {
            if (!galleryGrid) return;

            if (snapshot.empty) {
                galleryGrid.innerHTML = '<div class="gallery-empty"><p>No photos available in the gallery yet.</p></div>';
                return;
            }

            let html = '';
            snapshot.forEach((doc) => {
                const data = doc.data();
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
