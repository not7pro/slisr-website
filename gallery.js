import { db, ref, onValue, query, orderByChild } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const galleryGrid = document.getElementById('galleryGrid');

    // Premium fallback images for professional presentation if DB is empty
    const fallbackImages = [
        { url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop", caption: "Main Campus Building" },
        { url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800&auto=format&fit=crop", caption: "Chemistry Laboratory" },
        { url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=800&auto=format&fit=crop", caption: "School Library" },
        { url: "https://images.unsplash.com/photo-1577894778596-3a7294702f85?q=80&w=800&auto=format&fit=crop", caption: "Sports Day" },
        { url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop", caption: "Art Class" },
        { url: "https://images.unsplash.com/photo-1588072432836-e10032774350?q=80&w=1200&auto=format&fit=crop", caption: "Primary Education" }
    ];

    function renderGallery(items) {
        if (!galleryGrid) return;
        
        let html = '';
        items.forEach((data, index) => {
            html += `
                <div class="gallery-item" data-aos="fade-up" data-aos-delay="${index * 100}">
                    <div class="gallery-image-wrapper">
                        <img src="${data.url}" 
                             alt="${data.caption || 'School Photo'}" 
                             loading="lazy" 
                             class="gallery-img"
                             onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1577894778596-3a7294702f85?q=80&w=800&auto=format&fit=crop';">
                        <div class="gallery-overlay">
                            <span>${data.caption || 'View Photo'}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        galleryGrid.innerHTML = html;

        // Initialize Lightbox functionality for new items
        setupLightbox();
    }

    function initGallerySync() {
        if (!galleryGrid) return;
        
        const q = query(ref(db, 'gallery'), orderByChild('timestamp'));
        
        onValue(q, (snapshot) => {
            if (snapshot.exists()) {
                const items = [];
                snapshot.forEach((doc) => {
                    items.push(doc.val());
                });
                renderGallery(items.reverse());
            } else {
                // Use fallback images if DB is empty
                renderGallery(fallbackImages);
            }
        });
    }

    function setupLightbox() {
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        const lightboxCaption = document.getElementById('lightbox-caption');
        const closeBtn = document.getElementById('closeLightbox');

        if (!lightbox || !lightboxImg) return;

        document.querySelectorAll('.gallery-item').forEach(item => {
            item.onclick = () => {
                const img = item.querySelector('img');
                lightboxImg.src = img.src;
                lightboxCaption.textContent = img.alt;
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
            };
        });

        const closeLightbox = () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        };

        if (closeBtn) closeBtn.onclick = closeLightbox;
        lightbox.onclick = (e) => { if (e.target === lightbox) closeLightbox(); };
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeLightbox();
        });
    }

    initGallerySync();
});
