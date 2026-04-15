// About Page JavaScript
document.addEventListener('DOMContentLoaded', function () {
    initializeMobileMenu();
    initializeScrollAnimations();
    initializeTimeline();
    initializeCounterStats();
    console.log('About page initialized successfully! 🏫');
});

// ===== Mobile Menu =====
function initializeMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', function () {
            navLinks.classList.toggle('active');
            this.classList.toggle('active');

            // Animate hamburger icon
            const spans = this.querySelectorAll('span');
            if (this.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(8px, 8px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(7px, -7px)';
            } else {
                spans[0].style.transform = '';
                spans[1].style.opacity = '';
                spans[2].style.transform = '';
            }
        });
    }
}

// ===== Scroll Animations (General) =====
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Elements to animate
    const animateElements = document.querySelectorAll('.mission-card, .vision-card, .value-card, .leader-card, .section-title, .section-description');

    animateElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease-out';

        // Reset stagger for new sections
        // minimal stagger based on DOM order isn't perfect but works for simple layouts
        // or just remove stagger for titles to make them snappy
        if (el.classList.contains('section-title') || el.classList.contains('section-description')) {
            el.style.transitionDelay = '0s';
        } else {
            el.style.transitionDelay = `${(index % 3) * 0.1}s`;
        }

        observer.observe(el);
    });
}

// ===== Timeline Animation =====
function initializeTimeline() {
    const timelineItems = document.querySelectorAll('.timeline-item');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.2 });

    timelineItems.forEach(item => {
        observer.observe(item);
    });
}

// ===== Statistics Counter Animation =====
function initializeCounterStats() {
    const statsSection = document.querySelector('.achievements-section');
    const counters = document.querySelectorAll('.stat-number');
    let started = false;

    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !started) {
            started = true;
            counters.forEach(counter => {
                const target = +counter.getAttribute('data-target');
                const duration = 2000; // 2 seconds
                const increment = target / (duration / 16); // 60fps

                let current = 0;
                const updateCounter = () => {
                    current += increment;
                    if (current < target) {
                        counter.textContent = Math.ceil(current);
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.textContent = target;
                    }
                };

                updateCounter();
            });
        }
    }, { threshold: 0.5 });

    if (statsSection) {
        observer.observe(statsSection);
    }
}
