import { db, collection, onSnapshot, query, orderBy, auth, signOut } from './firebase-config.js';

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
    logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            try {
                localStorage.removeItem('adminLoggedIn');
                window.location.href = 'admin-login.html';
            } catch (error) {
                console.error("Logout error", error);
            }
        }
    });

    // --- REAL-TIME DATA SYNC ---
    let currentMessages = [];

    function initMessageListener() {
        const q = query(collection(db, 'messages'), orderBy('timestamp', 'desc'));
        
        onSnapshot(q, (snapshot) => {
            currentMessages = [];
            snapshot.forEach((doc) => {
                currentMessages.push({ id: doc.id, ...doc.data() });
            });
            renderMessages();
            updateStats();
        });
    }

    function renderMessages() {
        // Overview Mini List
        const miniList = document.getElementById('miniMessageList');
        if (miniList) {
            if (currentMessages.length === 0) {
                miniList.innerHTML = '<div class="empty-state"><p>No messages yet.</p></div>';
            } else {
                let miniHtml = '';
                currentMessages.slice(0, 3).forEach(msg => {
                    const time = msg.timestamp ? new Date(msg.timestamp.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now';
                    miniHtml += `
                        <div class="mini-msg-item" onclick="switchSection('messages')">
                            <div class="msg-dot"></div>
                            <div class="msg-content">
                                <strong>${msg.firstName} ${msg.lastName}</strong>
                                <p>${msg.subject}</p>
                            </div>
                            <span class="msg-time">${time}</span>
                        </div>
                    `;
                });
                miniList.innerHTML = miniHtml;
            }
        }

        // Full Inbox List
        const inboxList = document.getElementById('inboxList');
        if (inboxList) {
            let inboxHtml = '';
            currentMessages.forEach(msg => {
                const time = msg.timestamp ? new Date(msg.timestamp.seconds * 1000).toLocaleDateString() : 'Just now';
                inboxHtml += `
                    <div class="inbox-item" onclick="viewMessage('${msg.id}')">
                        <div class="msg-top">
                            <h4>${msg.firstName} ${msg.lastName}</h4>
                            <span class="msg-time">${time}</span>
                        </div>
                        <p class="msg-subject">${msg.subject}</p>
                        <p class="msg-preview">${msg.message}</p>
                    </div>
                `;
            });
            inboxList.innerHTML = inboxHtml || '<div class="empty-state"><p>Your inbox is empty</p></div>';
        }
    }

    window.viewMessage = function(docId) {
        const msg = currentMessages.find(m => m.id === docId);
        if (!msg) return;

        const viewer = document.getElementById('messageViewer');
        const time = msg.timestamp ? new Date(msg.timestamp.seconds * 1000).toLocaleString() : 'Just now';
        
        // Highlight active item
        document.querySelectorAll('.inbox-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('onclick').includes(docId)) item.classList.add('active');
        });

        viewer.innerHTML = `
            <div class="view-header">
                <div class="user-info-large">
                    <img src="https://ui-avatars.com/api/?name=${msg.firstName}+${msg.lastName}&background=random" class="avatar-large" alt="">
                    <div class="user-meta">
                        <h2>${msg.firstName} ${msg.lastName}</h2>
                        <p>${msg.email} &bull; Received ${time}</p>
                    </div>
                </div>
                <div class="view-actions">
                    <button class="archive-btn" onclick="deleteMessage('${msg.id}')"><i class="fas fa-trash"></i></button>
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

    function updateStats() {
        const inquiryStat = document.querySelector('.stats-grid .stat-card:nth-child(2) .number');
        if (inquiryStat) {
            inquiryStat.textContent = currentMessages.length;
        }
    }

    // Initializations
    initMessageListener();
});
