// Campus Life Page Script

document.addEventListener('DOMContentLoaded', function() {
    // 1. Extracurriculars Filter
    const filterBtns = document.querySelectorAll('.filter-btn');
    const clubCards = document.querySelectorAll('.club-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active to current button
            this.classList.add('active');

            const filterValue = this.getAttribute('data-filter');

            clubCards.forEach((card, index) => {
                const category = card.getAttribute('data-category');
                
                // Keep animation clean
                card.style.animation = 'none';
                
                setTimeout(() => {
                    if(filterValue === 'all' || filterValue === category) {
                        card.classList.remove('hidden');
                        card.style.animation = `fadeUp 0.6s ease ${index * 0.1}s backwards`;
                    } else {
                        card.classList.add('hidden');
                    }
                }, 10);
            });
        });
    });

    // 2. Testimonial Carousels
    const carousels = document.querySelectorAll('.carousel-container');
    
    carousels.forEach(carousel => {
        const slides = carousel.querySelectorAll('.testimonial-slide');
        const dots = carousel.querySelectorAll('.dot');
        const prevBtn = carousel.querySelector('.prev-btn');
        const nextBtn = carousel.querySelector('.next-btn');
        const slider = carousel.querySelector('.testimonials-slider');
        
        if (slides.length > 0) {
            let currentIndex = 0;

            function updateCarousel() {
                slides.forEach((slide, index) => {
                    slide.classList.remove('active');
                    if (index === currentIndex) {
                        slide.classList.add('active');
                    }
                });
                
                dots.forEach((dot, index) => {
                    dot.classList.remove('active');
                    if (index === currentIndex) {
                        dot.classList.add('active');
                    }
                });

                // Slide translation
                if(slider) {
                    slider.style.transform = `translateX(-${currentIndex * 100}%)`;
                }
            }

            if(nextBtn) {
                nextBtn.addEventListener('click', () => {
                    currentIndex = (currentIndex + 1) % slides.length;
                    updateCarousel();
                });
            }

            if(prevBtn) {
                prevBtn.addEventListener('click', () => {
                    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
                    updateCarousel();
                });
            }

            dots.forEach(dot => {
                dot.addEventListener('click', function() {
                    currentIndex = parseInt(this.getAttribute('data-index'));
                    updateCarousel();
                });
            });
            
            // Initial setup
            updateCarousel();
        }
    });
});
