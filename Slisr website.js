// Gallery Page JavaScript
// Sri Lankan International School Riyadh

// ===== Configuration =====
// Update these URLs with your actual social media links
const SOCIAL_MEDIA_LINKS = {
    instagram: 'https://www.instagram.com/slisrmediaunit/',
    facebook: 'https://www.facebook.com/SLISRSA',
    twitter: 'https://twitter.com/SLISR_official',
    youtube: 'https://www.youtube.com/@SLISRMediaUnit',
    linkedin: 'https://www.linkedin.com/school/slisr',
    whatsapp: 'https://wa.me/966XXXXXXXXX' // Replace with your WhatsApp number
};

// ===== DOM Elements =====
const socialLinks = document.querySelectorAll('.social-link');
const socialCards = document.querySelectorAll('.social-card');
const filterButtons = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCaption = document.getElementById('lightbox-caption');
const closeLightbox = document.querySelector('.close-lightbox');
const closeLightbox = document.querySelector('.close-lightbox');

// ===== Initialize on DOM Load =====
document.addEventListener('DOMContentLoaded', function () {
    initializeSocialLinks();
    initializeGalleryFilters();
    initializeLightbox();
    addCardClickEffects();
    addScrollAnimations();
    console.log('Gallery page initialized successfully! 🎓');
});

// ===== Social Media Functions =====
function initializeSocialLinks() {
    socialLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            const url = this.getAttribute('data-url');
            const platform = this.closest('.social-card').getAttribute('data-platform');

            // Use configured URL if available, otherwise use data-url attribute
            const finalUrl = SOCIAL_MEDIA_LINKS[platform] || url;

            // Add click animation
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);

            // Open link in new tab
            setTimeout(() => {
                window.open(finalUrl, '_blank', 'noopener,noreferrer');
            }, 200);

            // Track analytics (optional)
            trackSocialClick(platform);
        });
    });
}

function addCardClickEffects() {
    socialCards.forEach(card => {
        // Make entire card clickable
        card.addEventListener('click', function (e) {
            // Don't trigger if clicking the link directly
            if (!e.target.closest('.social-link')) {
                const link = this.querySelector('.social-link');
                if (link) {
                    link.click();
                }
            }
        });

        // Add ripple effect
        card.addEventListener('mousedown', function (e) {
            const ripple = document.createElement('div');
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'rgba(37, 99, 235, 0.3)';
            ripple.style.width = '10px';
            ripple.style.height = '10px';
            ripple.style.left = e.offsetX + 'px';
            ripple.style.top = e.offsetY + 'px';
            ripple.style.transform = 'translate(-50%, -50%)';
            ripple.style.animation = 'ripple 0.6s ease-out';
            ripple.style.pointerEvents = 'none';

            this.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });
    });
}

// Add ripple animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            width: 300px;
            height: 300px;
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

function trackSocialClick(platform) {
    // Log to console (replace with actual analytics)
    console.log(`Social media click: ${platform}`);

    // Example: Google Analytics tracking
    // if (typeof gtag !== 'undefined') {
    //     gtag('event', 'social_click', {
    //         'platform': platform,
    //         'page': 'gallery'
    //     });
    // }
}

// ===== Gallery Filter Functions =====
function initializeGalleryFilters() {
    filterButtons.forEach(button => {
        button.addEventListener('click', function () {
            const filter = this.getAttribute('data-filter');

            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Filter gallery items with animation
            filterGalleryItems(filter);
        });
    });
}

function filterGalleryItems(filter) {
    galleryItems.forEach((item, index) => {
        const category = item.getAttribute('data-category');

        // Remove animation class first
        item.style.animation = 'none';

        setTimeout(() => {
            if (filter === 'all' || category === filter) {
                item.classList.remove('hidden');
                // Reapply animation with staggered delay
                item.style.animation = `slideInUp 0.6s ease ${index * 0.1}s backwards`;
            } else {
                item.classList.add('hidden');
            }
        }, 10);
    });

    // Log filter action
    console.log(`Gallery filtered by: ${filter}`);
}

// ===== Lightbox Functions =====
function initializeLightbox() {
    // Open lightbox when clicking gallery items
    galleryItems.forEach(item => {
        item.addEventListener('click', function () {
            const img = this.querySelector('img');
            const caption = this.querySelector('p').textContent;

            if (img) {
                openLightbox(img.src, caption);
            } else {
                // For placeholder items, show a message
                showPlaceholderMessage(caption);
            }
        });
    });

    // Close lightbox
    if (closeLightbox) {
        closeLightbox.addEventListener('click', closeLightboxModal);
    }

    // Close on background click
    if (lightbox) {
        lightbox.addEventListener('click', function (e) {
            if (e.target === this) {
                closeLightboxModal();
            }
        });
    }

    // Close on ESC key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightboxModal();
        }
    });
}

function openLightbox(imgSrc, caption) {
    lightbox.classList.add('active');
    lightboxImg.src = imgSrc;
    lightboxCaption.textContent = caption;
    document.body.style.overflow = 'hidden'; // Prevent scrolling
}

function closeLightboxModal() {
    lightbox.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling

    // Clear image after animation
    setTimeout(() => {
        lightboxImg.src = '';
        lightboxCaption.textContent = '';
    }, 300);
}

function showPlaceholderMessage(caption) {
    alert(`This is a placeholder for: ${caption}\n\nReplace gallery placeholders with actual images by updating the HTML.`);
}

// ===== Scroll Animations =====
function addScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe sections for scroll animations
    const sections = document.querySelectorAll('.social-media-section, .photo-gallery-section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
}

// ===== Smooth Scroll for Navigation =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');

        if (targetId && targetId !== '#') {
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// ===== Dynamic Gallery Loading (Example) =====
// This function demonstrates how to dynamically load gallery images
function loadGalleryImages(images) {
    const galleryGrid = document.getElementById('galleryGrid');

    if (!galleryGrid) return;

    // Clear existing placeholders (optional)
    // galleryGrid.innerHTML = '';

    images.forEach((image, index) => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.setAttribute('data-category', image.category);

        galleryItem.innerHTML = `
            <img src="${image.url}" alt="${image.caption}" loading="lazy">
            <div class="gallery-overlay">
                <p>${image.caption}</p>
            </div>
        `;

        galleryGrid.appendChild(galleryItem);

        // Add click event for lightbox
        galleryItem.addEventListener('click', function () {
            openLightbox(image.url, image.caption);
        });
    });

    console.log(`Loaded ${images.length} gallery images`);
}

// Example usage (uncomment and modify as needed):
/*
const sampleImages = [
    { url: 'images/event1.jpg', caption: 'Annual Day 2024', category: 'events' },
    { url: 'images/sports1.jpg', caption: 'Football Match', category: 'sports' },
    { url: 'images/campus1.jpg', caption: 'School Building', category: 'campus' }
];

// Load images when ready
loadGalleryImages(sampleImages);
*/

// ===== Social Media Share Function =====
function shareOnSocialMedia(platform, url, text) {
    const shareUrls = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`
    };

    if (shareUrls[platform]) {
        window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
}

// ===== Performance: Lazy Load Images =====
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            }
        });
    });

    // Observe all images with data-src attribute
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ===== Utility Functions =====
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Example: Debounced window resize handler
window.addEventListener('resize', debounce(function () {
    console.log('Window resized');
    // Add any resize-specific logic here
}, 250));

// ===== Export functions for external use (optional) =====
window.GalleryApp = {
    loadGalleryImages,
    shareOnSocialMedia,
    openLightbox,
    closeLightboxModal
};

console.log('🎨 Gallery App loaded. Use window.GalleryApp for API access.');
