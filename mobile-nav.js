(function () {
    document.addEventListener('DOMContentLoaded', function () {
        const toggle = document.querySelector('.mobile-menu-btn');
        const navLinks = document.querySelector('.nav-links');
        const navbar = document.querySelector('.navbar, nav.navbar');

        if (!toggle || !navLinks) return;

        function toggleMenu(forceClose = false) {
            const spans = toggle.querySelectorAll('span');
            const isActive = forceClose ? false : !navLinks.classList.contains('active');

            if (isActive) {
                navLinks.classList.add('active');
                if (spans.length >= 3) {
                    spans[0].style.transform = 'rotate(45deg) translate(5px, 6px)';
                    spans[1].style.opacity = '0';
                    spans[2].style.transform = 'rotate(-45deg) translate(5px, -6px)';
                }
            } else {
                navLinks.classList.remove('active');
                if (spans.length >= 3) {
                    spans[0].style.transform = '';
                    spans[1].style.opacity = '1';
                    spans[2].style.transform = '';
                }
            }
        }

        toggle.addEventListener('click', function (e) {
            e.stopPropagation();
            toggleMenu();
        });

        // Close on outside click
        document.addEventListener('click', function (e) {
            if (navLinks.classList.contains('active') && !navbar.contains(e.target)) {
                toggleMenu(true);
            }
        });

        // Close when a link is clicked
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => toggleMenu(true));
        });

        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                toggleMenu(true);
            }
        });

        // Active link highlighting
        const current = window.location.pathname.split('/').pop() || 'index.html';
        navLinks.querySelectorAll('a').forEach(link => {
            const href = (link.getAttribute('href') || '').split('/').pop();
            if (href === current) link.classList.add('active');
        });
    });
})();
