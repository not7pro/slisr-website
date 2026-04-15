// Admissions Page Interactivity

document.addEventListener('DOMContentLoaded', () => {
    // Scroll Animations using Intersection Observer
    const animatedElements = document.querySelectorAll('[data-aos]');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const animateOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Apply a slight delay if specified via data attribute
                const delay = entry.target.getAttribute('data-aos-delay');
                if (delay) {
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, parseInt(delay));
                } else {
                    entry.target.classList.add('visible');
                }
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => animateOnScroll.observe(el));

    // Form Submission Handling
    const form = document.getElementById('admissionsForm');
    const successMessage = document.getElementById('formSuccessMessage');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Basic validation check (html attributes handle most of it)
            const name = document.getElementById('parentName').value.trim();
            const email = document.getElementById('email').value.trim();
            const grade = document.getElementById('studentGrade').value;

            if (name && email && grade) {
                // Hide the form and show the success message
                form.style.display = 'none';
                successMessage.classList.remove('hidden');
                
                // You would normally send the data to a server here using fetch()
                console.log('Form Submitted. Name:', name, 'Email:', email, 'Grade:', grade);
            }
        });
    }
});
