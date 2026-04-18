// Home Page JavaScript
// Sri Lankan International School Riyadh

// ===== DOM Elements =====
const virtualTourBtn = document.getElementById('virtualTourBtn');
const applyNowBtn = document.getElementById('applyNowBtn');
const enrollBtn = document.querySelector('.enroll-btn');
const infoCards = document.querySelectorAll('.info-card');
const infoLinks = document.querySelectorAll('.info-link');
const accessibilityBtn = document.querySelector('.accessibility-btn');

// ===== Initialize on DOM Load =====
document.addEventListener('DOMContentLoaded', function () {
    initializeButtons();
    initializeScrollAnimations();
    initializeCardHoverEffects();
    initializeAccessibility();
    console.log('Home page initialized successfully! 🎓');
});

// ===== Button Interactions =====
function initializeButtons() {
    // Add ripple effect to all buttons
    const buttons = document.querySelectorAll('.btn, .enroll-btn');

    buttons.forEach(button => {
        button.addEventListener('click', function (e) {
            createRipple(e, this);
        });
    });

    // Virtual Tour Button
    if (virtualTourBtn) {
        virtualTourBtn.addEventListener('click', function () {
            addClickAnimation(this);
            setTimeout(() => {
                console.log('Virtual Tour clicked');
                // Add your virtual tour logic here
                showNotification('Virtual Tour feature coming soon!');
            }, 300);
        });
    }

    // Apply Now Button
    if (applyNowBtn) {
        applyNowBtn.addEventListener('click', function () {
            addClickAnimation(this);
            setTimeout(() => {
                console.log('Apply Now clicked');
                // Add your application logic here
                showNotification('Redirecting to application form...');
                // window.location.href = 'admissions.html';
            }, 300);
        });
    }

    // Enroll Now Button
    if (enrollBtn) {
        enrollBtn.addEventListener('click', function () {
            console.log('Enroll Now clicked');
            showNotification('Opening enrollment form...');
            // window.location.href = 'enrollment.html';
        });
    }
}

// Create ripple effect on button click
function createRipple(event, button) {
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');

    button.appendChild(ripple);

    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Add click animation to buttons
function addClickAnimation(button) {
    button.style.transform = 'scale(0.95)';

    setTimeout(() => {
        button.style.transform = '';
    }, 150);
}

// ===== Scroll Animations =====
function initializeScrollAnimations() {
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

    // Observe info cards
    infoCards.forEach(card => {
        observer.observe(card);
    });
}

// ===== Card Hover Effects =====
function initializeCardHoverEffects() {
    infoCards.forEach(card => {
        // Add subtle floating animation on hover
        card.addEventListener('mouseenter', function () {
            this.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        });

        card.addEventListener('mouseleave', function () {
            this.style.transition = 'all 0.4s ease';
        });
    });

    // Enhance link interactions
    infoLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            // Add click feedback
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 100);

            // Get link text for logging
            const linkText = this.querySelector('span').textContent;
            console.log(`Info link clicked: ${linkText}`);

            // Add your navigation logic here
            showNotification(`Opening ${linkText}...`);
            
            const targetHref = this.getAttribute('href');
            if (targetHref && targetHref !== '#') {
                setTimeout(() => {
                    window.location.href = targetHref;
                }, 300);
            }
        });
    });
}

// ===== Accessibility Features =====
function initializeAccessibility() {
    if (accessibilityBtn) {
        accessibilityBtn.addEventListener('click', function () {
            document.body.classList.toggle('high-contrast');

            // Add animation feedback
            this.style.transform = 'rotate(360deg) scale(1.2)';
            setTimeout(() => {
                this.style.transform = '';
            }, 400);

            const isHighContrast = document.body.classList.contains('high-contrast');
            showNotification(isHighContrast ? 'High contrast mode enabled' : 'High contrast mode disabled');
        });
    }
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

// ===== Notification System =====
function showNotification(message) {
    // Check if notification already exists
    let notification = document.querySelector('.notification');

    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);

        // Add notification styles dynamically
        const style = document.createElement('style');
        style.textContent = `
            .notification {
                position: fixed;
                top: 100px;
                right: 30px;
                background: #1e293b;
                color: #fff;
                padding: 16px 24px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                z-index: 10000;
                font-family: 'Inter', sans-serif;
                font-size: 14px;
                font-weight: 500;
                opacity: 0;
                transform: translateX(400px);
                transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
            
            .notification.show {
                opacity: 1;
                transform: translateX(0);
            }
            
            @media (max-width: 768px) {
                .notification {
                    top: 80px;
                    right: 20px;
                    left: 20px;
                    text-align: center;
                }
            }
        `;
        document.head.appendChild(style);
    }

    notification.textContent = message;

    // Trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// ===== Parallax Effect for Hero Section =====
window.addEventListener('scroll', function () {
    const scrolled = window.pageYOffset;
    const heroSection = document.querySelector('.hero-section');

    if (heroSection && scrolled < 600) {
        heroSection.style.transform = `translateY(${scrolled * 0.5}px)`;
        heroSection.style.opacity = 1 - (scrolled / 800);
    }
});

// ===== Dynamic Year in Footer =====
// If you add a footer later, this will update the year automatically
const yearElements = document.querySelectorAll('.current-year');
if (yearElements.length > 0) {
    const currentYear = new Date().getFullYear();
    yearElements.forEach(el => {
        el.textContent = currentYear;
    });
}

// ===== Button Hover Magnetic Effect =====
const heroButtons = document.querySelectorAll('.hero-buttons .btn');

heroButtons.forEach(button => {
    button.addEventListener('mousemove', function (e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        this.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px) scale(1.05)`;
    });

    button.addEventListener('mouseleave', function () {
        this.style.transform = '';
    });
});

// ===== Stagger Animation for Info Cards =====
function staggerInfoCards() {
    infoCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Call stagger on load
window.addEventListener('load', staggerInfoCards);

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

// Debounced window resize handler
window.addEventListener('resize', debounce(function () {
    console.log('Window resized');
    // Add any resize-specific logic here
}, 250));

// ===== Export functions for external use =====
window.HomeApp = {
    showNotification,
    createRipple
};

console.log('🏠 Home App loaded. Use window.HomeApp for API access.');
