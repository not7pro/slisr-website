/**
 * mobile-nav.js  — shared hamburger menu for all public pages
 * Handles: open/close, outside-click dismiss, active link highlight
 */
(function () {
    document.addEventListener('DOMContentLoaded', function () {
        const toggle = document.querySelector('.mobile-menu-btn');
        const navLinks = document.querySelector('.nav-links');
        const navbar = document.querySelector('.navbar, nav.navbar');

        if (!toggle || !navLinks) return;

        // ── Toggle open/close ───────────────────────────────────
        toggle.addEventListener('click', function (e) {
            e.stopPropagation();
            navLinks.classList.toggle('active');

            // Animate hamburger → X
            const spans = toggle.querySelectorAll('span');
            const isOpen = navLinks.classList.contains('active');
            if (spans.length >= 3) {
                spans[0].style.transform = isOpen ? 'rotate(45deg) translate(5px, 6px)' : '';
                spans[1].style.opacity  = isOpen ? '0' : '1';
                spans[2].style.transform = isOpen ? 'rotate(-45deg) translate(5px, -6px)' : '';
            }
        });

        // ── Close on outside click ──────────────────────────────
        document.addEventListener('click', function (e) {
            if (!navbar || navbar.contains(e.target)) return;
            navLinks.classList.remove('active');
            resetHamburger();
        });

        // ── Close when a link is clicked ────────────────────────
        navLinks.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                navLinks.classList.remove('active');
                resetHamburger();
            });
        });

        // ── Escape key ──────────────────────────────────────────
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                navLinks.classList.remove('active');
                resetHamburger();
            }
        });

        function resetHamburger() {
            const spans = toggle.querySelectorAll('span');
            spans.forEach(function (s) {
                s.style.transform = '';
                s.style.opacity  = '1';
            });
        }

        // ── Mark active link ────────────────────────────────────
        var current = window.location.pathname.split('/').pop() || 'index.html';
        navLinks.querySelectorAll('a').forEach(function (link) {
            var href = (link.getAttribute('href') || '').split('/').pop();
            if (href === current) link.classList.add('active');
        });
    });
})();
