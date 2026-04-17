import { db, ref, set, push, remove, onValue, query, orderByChild, auth, signOut, serverTimestamp } from './firebase-config.js';

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
        const q = query(ref(db, 'messages'), orderByChild('timestamp'));
        
        onValue(q, (snapshot) => {
            currentMessages = [];
            snapshot.forEach((childSnapshot) => {
                currentMessages.push({ id: childSnapshot.key, ...childSnapshot.val() });
            });
            currentMessages.reverse();
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
                    const time = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now';
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
                const time = msg.timestamp ? new Date(msg.timestamp).toLocaleDateString() : 'Just now';
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
        const time = msg.timestamp ? new Date(msg.timestamp).toLocaleString() : 'Just now';
        
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
                <div class="view-actions" style="display: flex; gap: 10px; align-items: center;">
                    <a href="https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(msg.email)}&su=Re:%20${encodeURIComponent(msg.subject)}&body=${encodeURIComponent('Hi ' + msg.firstName + ',\\n\\n')}" target="_blank" class="reply-btn" style="text-decoration: none; padding: 8px 15px; font-size: 13px;"><i class="fas fa-reply"></i> Reply via Gmail</a>
                    <button class="icon-btn-delete" title="Delete Inquiry" onclick="deleteMessage('${msg.id}')" style="background:#fee2e2; color:#ef4444; border:none; width:40px; height:40px; border-radius:8px; cursor:pointer;"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            <div class="view-body">
                <h3>Subject: ${msg.subject}</h3>
                <p style="white-space: pre-wrap;">${msg.message}</p>
            </div>
        `;
    };

    window.deleteMessage = async function(id) {
        if (confirm('Mark this inquiry as handled and archive it?')) {
            try {
                await remove(ref(db, 'messages/' + id));
                const viewer = document.getElementById('messageViewer');
                if (viewer.innerHTML.includes(id)) {
                    viewer.innerHTML = '<div class="viewer-empty"><i class="fas fa-envelope-open"></i><p>Select a message to view details</p></div>';
                }
            } catch (error) {
                console.error("Archive error", error);
                alert("Failed to archive message.");
            }
        }
    };

    function updateStats() {
        const inquiryStat = document.querySelector('.stats-grid .stat-card:nth-child(2) .number');
        if (inquiryStat) {
            inquiryStat.textContent = currentMessages.length;
        }
    }

    // --- CMS: ACADEMICS & FEES ---
    function initAcademicsListener() {
        const q = query(ref(db, 'fees'), orderByChild('order'));
        onValue(q, (snapshot) => {
            const tbody = document.getElementById('feesTableBody');
            if (!tbody) return;
            
            let html = '';
            snapshot.forEach((doc) => {
                const data = doc.val();
                html += `
                    <tr data-id="${doc.key}">
                        <td><input type="text" class="fee-grade" value="${data.grade}"></td>
                        <td><input type="text" class="fee-admission" value="${data.admission}"></td>
                        <td><input type="text" class="fee-tuition" value="${data.tuition}"></td>
                        <td><button class="action-btn btn-delete" onclick="deleteFeeRow('${doc.key}')"><i class="fas fa-trash"></i></button></td>
                    </tr>
                `;
            });
            tbody.innerHTML = html;
        });
    }

    const saveFeesBtn = document.getElementById('saveFeesBtn');
    if (saveFeesBtn) {
        saveFeesBtn.addEventListener('click', async () => {
            saveFeesBtn.disabled = true;
            saveFeesBtn.textContent = 'Saving...';
            
            const rows = document.querySelectorAll('#feesTableBody tr');
            const promises = Array.from(rows).map((row, index) => {
                const id = row.getAttribute('data-id');
                const data = {
                    grade: row.querySelector('.fee-grade').value,
                    admission: row.querySelector('.fee-admission').value,
                    tuition: row.querySelector('.fee-tuition').value,
                    order: index
                };
                
                if (id) {
                    return set(ref(db, 'fees/' + id), data);
                } else {
                    return push(ref(db, 'fees'), data);
                }
            });
            
            try {
                await Promise.all(promises);
                alert('Success: Fee structure saved to database.');
            } catch (error) {
                console.error("Save error", error);
                alert('Error saving data.');
            }
            
            saveFeesBtn.disabled = false;
            saveFeesBtn.textContent = 'Save Changes';
        });
    }

    window.addFeeRow = function() {
        const tbody = document.getElementById('feesTableBody');
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="text" class="fee-grade" placeholder="e.g. Grade 1"></td>
            <td><input type="text" class="fee-admission" placeholder="e.g. 500"></td>
            <td><input type="text" class="fee-tuition" placeholder="e.g. 5000"></td>
            <td><button class="action-btn btn-delete" onclick="this.parentElement.parentElement.remove()"><i class="fas fa-trash"></i></button></td>
        `;
        tbody.appendChild(tr);
    };

    window.deleteFeeRow = async function(id) {
        if (confirm('Delete this fee entry?')) {
            try {
                await remove(ref(db, 'fees/' + id));
            } catch (error) {
                console.error("Delete error", error);
            }
        }
    };

    // --- CMS: NEWS & EVENTS ---
    const newsModal = document.getElementById('newsModal');
    const openNewsBtn = document.getElementById('openNewsModalBtn');
    const closeNewsBtn = document.getElementById('closeNewsModal');
    const newsForm = document.getElementById('newsForm');

    if (openNewsBtn) openNewsBtn.onclick = () => newsModal.style.display = 'block';
    if (closeNewsBtn) closeNewsBtn.onclick = () => newsModal.style.display = 'none';

    if (newsForm) {
        newsForm.onsubmit = async (e) => {
            e.preventDefault();
            const btn = newsForm.querySelector('button');
            btn.disabled = true;
            btn.textContent = 'Publishing...';

            const data = {
                title: document.getElementById('newsTitle').value,
                category: document.getElementById('newsCategory').value,
                description: document.getElementById('newsDesc').value,
                timestamp: serverTimestamp()
            };

            try {
                await push(ref(db, 'news'), data);
                newsForm.reset();
                newsModal.style.display = 'none';
                alert('Post published successfully!');
            } catch (error) {
                console.error("News error", error);
                alert('Error publishing post.');
            }
            btn.disabled = false;
            btn.textContent = 'Publish Post';
        };
    }

    window.deleteNews = async function(id) {
        if (confirm('Permanently delete this post?')) {
            try {
                await remove(ref(db, 'news/' + id));
            } catch (error) {
                console.error("Delete error", error);
            }
        }
    };

    function initNewsListener() {
        onValue(ref(db, 'news'), (snapshot) => {

            const grid = document.getElementById('newsManagerGrid');
            if (!grid) return;
            
            let html = '';
            snapshot.forEach((doc) => {
                const data = doc.val();
                html += `
                    <div class="news-item-card">
                        <span class="badge blue">${data.category}</span>
                        <h4>${data.title}</h4>
                        <p>${data.description.substring(0, 100)}...</p>
                        <div class="card-actions">
                            <button class="action-btn btn-delete" onclick="deleteNews('${doc.key}')">Delete</button>
                        </div>
                    </div>
                `;
            });
            grid.innerHTML = html;
        });
    }

    function initGalleryListener() {
        onValue(ref(db, 'gallery'), (snapshot) => {

            const grid = document.getElementById('galleryManagerGrid');
            if (!grid) return;
            
            let html = '';
            snapshot.forEach((doc) => {
                const data = doc.val();
                html += `
                    <div class="gallery-item-card">
                        <img src="${data.url}" alt="">
                        <div class="gallery-item-info">
                            <button class="action-btn btn-delete" onclick="deletePhoto('${doc.key}')">Delete</button>
                        </div>
                    </div>
                `;
            });
            grid.innerHTML = html;
        });
    }

    window.deletePhoto = async function(id) {
        if (confirm('Permanently delete this photo?')) {
            try {
                await remove(ref(db, 'gallery/' + id));
            } catch (error) {
                console.error("Delete error", error);
            }
        }
    };

    const addPhotoBtn = document.getElementById('addPhotoBtn');
    if (addPhotoBtn) {
        addPhotoBtn.onclick = async () => {
            const url = prompt('Enter image URL:');
            if (url) {
                try {
                    await push(ref(db, 'gallery'), {
                        url: url,
                        timestamp: serverTimestamp()
                    });
                } catch (error) {
                    console.error("Add photo error", error);
                }
            }
        };
    }

    // Initializations
    initMessageListener();
    initAcademicsListener();
    initNewsListener();
    initGalleryListener();
});
