document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.dashboard-section');
    const sectionTitle = document.getElementById('sectionTitle');
    const sectionSubtitle = document.getElementById('sectionSubtitle');
    const logoutBtn = document.getElementById('logoutBtn');

    // Section Switching Logic
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            if (item.id === 'logoutBtn') return;
            e.preventDefault();

            const targetSection = item.getAttribute('data-section');
            if (!targetSection) return;

            switchSection(targetSection);
        });
    });

    window.switchSection = function(sectionId) {
        // Update Nav
        navItems.forEach(i => {
            i.classList.remove('active');
            if (i.getAttribute('data-section') === sectionId) i.classList.add('active');
        });

        // Hide all sections
        sections.forEach(s => s.classList.remove('active'));
        
        // Show target section or fallback to overview
        const target = document.getElementById(sectionId + 'Section');
        if (target) {
            target.classList.add('active');
        } else {
            document.getElementById('overviewSection').classList.add('active');
        }

        updateHeader(sectionId);
    };

    function updateHeader(section) {
        const titles = {
            'overview': { title: 'Dashboard Overview', sub: "Welcome back, Admin! Here's what's happening today." },
            'messages': { title: 'Contact Messages', sub: 'Manage and respond to school inquiries.' },
            'academics': { title: 'Academic Management', sub: 'Update curriculum, fees, and schedules.' },
            'news': { title: 'News & Events', sub: 'Post updates and announce upcoming school events.' },
            'gallery': { title: 'Gallery Management', sub: 'Manage school photos and social media links.' }
        };

        if (titles[section]) {
            sectionTitle.textContent = titles[section].title;
            sectionSubtitle.textContent = titles[section].sub;
        }
    }

    // Logout Logic
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('adminLoggedIn');
            window.location.href = 'admin-login.html';
        }
    });

    // Mock Data
    const mockMessages = [
        { id: 1, name: 'John Doe', email: 'john@example.com', subject: 'Admissions Inquiry', time: '2h ago', message: 'Hello, I would like to know the admission process for Grade 5 for the upcoming academic year. What are the required documents?' },
        { id: 2, name: 'Sara Khan', email: 'sara.k@gmail.com', subject: 'Fee Structure Query', time: '5h ago', message: 'Can you please send me the transportation fee details for Riyadh area? My child is in KG2.' },
        { id: 3, name: 'Michael Chen', email: 'm.chen@outlook.com', subject: 'School Tour Request', time: 'Yesterday', message: 'I am planning to visit the campus next Monday. Are school tours available during school hours?' },
        { id: 4, name: 'Amara de Silva', email: 'amara@slt.lk', subject: 'Academic Calendar', time: '2 days ago', message: 'When are the summer vacations starting? We need to plan our travel accordingly.' }
    ];

    function loadMockMessages() {
        // Mini list on Overview
        const miniList = document.getElementById('miniMessageList');
        if (miniList) {
            let miniHtml = '';
            mockMessages.slice(0, 3).forEach(msg => {
                miniHtml += `
                    <div class="mini-msg-item" onclick="switchSection('messages')">
                        <div class="msg-dot"></div>
                        <div class="msg-content">
                            <strong>${msg.name}</strong>
                            <p>${msg.subject}</p>
                        </div>
                        <span class="msg-time">${msg.time}</span>
                    </div>
                `;
            });
            miniList.innerHTML = miniHtml;
        }

        // Full Inbox
        const inboxList = document.getElementById('inboxList');
        if (inboxList) {
            let inboxHtml = '';
            mockMessages.forEach(msg => {
                inboxHtml += `
                    <div class="inbox-item" onclick="viewMessage(${msg.id})">
                        <div class="msg-top">
                            <h4>${msg.name}</h4>
                            <span class="msg-time">${msg.time}</span>
                        </div>
                        <p class="msg-subject">${msg.subject}</p>
                        <p class="msg-preview">${msg.message}</p>
                    </div>
                `;
            });
            inboxList.innerHTML = inboxHtml;
        }
    }

    window.viewMessage = function(id) {
        const msg = mockMessages.find(m => m.id === id);
        const viewer = document.getElementById('messageViewer');
        
        // Highlight active item
        document.querySelectorAll('.inbox-item').forEach((item, index) => {
            item.classList.remove('active');
            if (index === id - 1) item.classList.add('active');
        });

        viewer.innerHTML = `
            <div class="view-header">
                <div class="user-info-large">
                    <img src="https://ui-avatars.com/api/?name=${msg.name}&background=random" class="avatar-large" alt="">
                    <div class="user-meta">
                        <h2>${msg.name}</h2>
                        <p>${msg.email} &bull; Received ${msg.time}</p>
                    </div>
                </div>
                <div class="view-actions">
                    <button class="archive-btn"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            <div class="view-body">
                <h3>Subject: ${msg.subject}</h3>
                <p>${msg.message}</p>
            </div>
            <div class="view-footer">
                <button class="reply-btn"><i class="fas fa-reply"></i> Reply to Inquiry</button>
                <button class="archive-btn"><i class="fas fa-check"></i> Mark as Handled</button>
            </div>
        `;
    };

    // Initial Load
    setTimeout(loadMockMessages, 800);
});
