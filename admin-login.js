document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Mock Login Logic (Replace with Firebase Auth later)
        if (email === 'admin@slisr.com' && password === 'admin123') {
            const btn = loginForm.querySelector('.login-btn');
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
            btn.style.opacity = '0.7';
            btn.disabled = true;

            setTimeout(() => {
                localStorage.setItem('adminLoggedIn', 'true');
                window.location.href = 'admin.html';
            }, 1500);
        } else {
            alert('Invalid credentials. Please try admin@slisr.com / admin123');
        }
    });
});
