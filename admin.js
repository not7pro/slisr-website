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
            'gallery': { title: 'Gallery Management', sub: 'Manage school photos and social media links.' },
            'applications': { title: 'Applications Inbox', sub: 'Review and respond to student admission applications.' }
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
                await logActivity('Archived inquiry from a visitor.');
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

    
    // --- CMS: APPLICATIONS INBOX ---
    let currentApps = [];
    
    function initApplicationsListener() {
        const q = query(ref(db, 'applications'));
        onValue(q, (snapshot) => {
            const list = document.getElementById('appList');
            if (!list) return;
            
            currentApps = [];
            let html = '';
            
            if (!snapshot.exists()) {
                list.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>No applications received yet.</p></div>';
                const appBadge = document.getElementById('appBadge');
                if(appBadge) appBadge.style.display = 'none';
                return;
            }

            snapshot.forEach((doc) => {
                const data = doc.val();
                currentApps.push({ id: doc.key, ...data });
            });

            // Sort newest first
            currentApps.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            currentApps.forEach(app => {
                const isNew = app.status === 'new';
                const time = app.timestamp ? new Date(app.timestamp).toLocaleDateString() : '';
                html += `
                    <div class="inbox-item ${isNew ? 'unread' : ''}" onclick="viewApplication('${app.id}')" id="app_${app.id}">
                        <div class="item-header">
                            <h4>${app.studentName}</h4>
                            <span class="time">${time}</span>
                        </div>
                        <div class="item-subject">Grade: ${app.grade}</div>
                        <div class="item-preview">Parent: ${app.parentName}</div>
                    </div>
                `;
            });
            
            list.innerHTML = html;
            
            // Update badge
            const newCount = currentApps.filter(a => a.status === 'new').length;
            const appBadge = document.getElementById('appBadge');
            if (appBadge) {
                if (newCount > 0) {
                    appBadge.textContent = newCount;
                    appBadge.style.display = 'inline-flex';
                } else {
                    appBadge.style.display = 'none';
                }
            }
        });
    }

    window.viewApplication = function(docId) {
        const app = currentApps.find(a => a.id === docId);
        if (!app) return;
        
        // Mark as read in UI locally
        const elem = document.getElementById('app_' + docId);
        if (elem && elem.classList.contains('unread')) {
            elem.classList.remove('unread');
            // Update object to prevent badge resync issues before reload
            app.status = 'read';
            set(ref(db, 'applications/' + docId + '/status'), 'read');
        }

        const viewer = document.getElementById('appViewer');
        const time = app.timestamp ? new Date(app.timestamp).toLocaleString() : 'Just now';
        
        // Highlight active item
        document.querySelectorAll('#appList .inbox-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('onclick').includes(docId)) item.classList.add('active');
        });

        viewer.innerHTML = `
            <div class="view-header">
                <div class="user-info-large">
                    <img src="https://ui-avatars.com/api/?name=${app.studentName}&background=random" class="avatar-large" alt="">
                    <div class="user-meta">
                        <h2>${app.studentName} ${app.grade ? '- ' + app.grade : ''}</h2>
                        <p>Parent: ${app.parentName} &bull; ${app.email} &bull; ${app.phone}</p>
                    </div>
                </div>
                <div class="view-actions" style="display: flex; gap: 10px; align-items: center;">
                    <a href="https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(app.email)}&su=Re:%20Admission%20Application%20for%20${encodeURIComponent(app.studentName)}&body=${encodeURIComponent('Dear ' + app.parentName + ',\n\nThank you for applying to Sri Lankan International School Riyadh.\n\n')}" target="_blank" class="reply-btn" style="text-decoration: none; padding: 8px 15px; font-size: 13px;"><i class="fas fa-reply"></i> Reply via Gmail</a>
                    <button class="icon-btn-delete" title="Archive Application" onclick="deleteApplication('${app.id}')" style="background:#fee2e2; color:#ef4444; border:none; width:40px; height:40px; border-radius:8px; cursor:pointer;"><i class="fas fa-check"></i></button>
                </div>
            </div>
            <div class="view-body" style="font-size: 16px; line-height: 1.8; color: #334155;">
                <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                    <h3 style="margin-bottom: 15px; color: #0f172a;">Application Details</h3>
                    <p><strong>Applying Grade:</strong> ${app.grade}</p>
                    <p><strong>Previous School:</strong> ${app.prevSchool || 'N/A'}</p>
                    <p><strong>Submitted:</strong> ${time}</p>
                </div>
                <h4 style="margin-bottom: 10px; color: #0f172a;">Additional Notes / Medical Info:</h4>
                <p style="white-space: pre-wrap; margin-left: 5px;">${app.notes || 'No additional notes provided.'}</p>
            </div>
        `;
    };

    window.deleteApplication = async function(id) {
        if (confirm('Mark this application as processed and archive it?')) {
            try {
                await remove(ref(db, 'applications/' + id));
                await logActivity('Processed and archived a student application.');
                const viewer = document.getElementById('appViewer');
                if (viewer.innerHTML.includes(id)) {
                    viewer.innerHTML = '<div class="viewer-empty"><i class="fas fa-file-alt"></i><p>Select an application to review</p></div>';
                }
            } catch (error) {
                console.error("Archive error", error);
                alert("Failed to archive application.");
            }
        }
    };
    
    initApplicationsListener();

    function updateStats() {
        // New Inquiries - live from messages array
        const inquiryStat = document.querySelector('.stats-grid .stat-card:nth-child(2) .number');
        if (inquiryStat) inquiryStat.textContent = currentMessages.length;
    }

    // --- LIVE OVERVIEW STATS ---
    function initLiveStats() {
        // 1. Real Visitor Count from analytics.js atomic writes
        onValue(ref(db, 'stats/total_visitors'), (snap) => {
            const visitorEl = document.querySelector('.stats-grid .stat-card:nth-child(1) .number');
            if (visitorEl) visitorEl.textContent = (snap.val() || 0).toLocaleString();
        });

        // 2. Active Events count from news node
        onValue(ref(db, 'news'), (snap) => {
            const eventsEl = document.querySelector('.stats-grid .stat-card:nth-child(3) .number');
            if (eventsEl) eventsEl.textContent = snap.exists() ? snap.size : 0;
        });

        // 3. Applications badge on overview
        onValue(ref(db, 'applications'), (snap) => {
            const appBadge = document.getElementById('appBadge');
            if (!appBadge) return;
            const count = snap.exists() ? snap.size : 0;
            if (count > 0) {
                appBadge.textContent = count;
                appBadge.style.display = 'inline-flex';
            } else {
                appBadge.style.display = 'none';
            }
        });

        // 4. Live System Activity Log (last 5 events)
        initActivityLog();
    }

    function initActivityLog() {
        onValue(ref(db, 'logs'), (snap) => {
            const timeline = document.querySelector('.activity-timeline');
            if (!timeline) return;

            if (!snap.exists()) {
                timeline.innerHTML = '<div class="timeline-item"><span class="time">—</span><p>No activity recorded yet.</p></div>';
                return;
            }

            const logs = [];
            snap.forEach(child => logs.push(child.val()));
            // Newest first, show last 8
            logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            const recent = logs.slice(0, 8);

            timeline.innerHTML = recent.map(log => {
                const when = timeAgo(new Date(log.timestamp));
                return `<div class="timeline-item">
                    <span class="time">${when}</span>
                    <p>${log.action}</p>
                </div>`;
            }).join('');
        });
    }

    function timeAgo(date) {
        const diff = Date.now() - date.getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return mins + 'm ago';
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return hrs + 'h ago';
        return Math.floor(hrs / 24) + 'd ago';
    }

    async function logActivity(action) {
        try {
            await push(ref(db, 'logs'), {
                action,
                timestamp: new Date().toISOString()
            });
        } catch (e) {
            console.warn('Activity log write failed (non-critical):', e.message);
        }
    }
    window.logActivity = logActivity;

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
                logActivity('Updated the school tuition fee structure.');
            } catch (error) {
                console.error("Save error", error);
                alert('Error saving data.');
            }
            
            saveFeesBtn.disabled = false;
            saveFeesBtn.textContent = 'Save Changes';
        });
    }

    const addFeeRowBtn = document.getElementById('addFeeRowBtn');
    if (addFeeRowBtn) {
        addFeeRowBtn.addEventListener('click', () => {
            const tbody = document.getElementById('feesTableBody');
            if(!tbody) return;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><input type="text" class="fee-grade" placeholder="e.g. Grade 1"></td>
                <td><input type="text" class="fee-admission" placeholder="e.g. 500"></td>
                <td><input type="text" class="fee-tuition" placeholder="e.g. 5000"></td>
                <td><button class="action-btn btn-delete" onclick="this.parentElement.parentElement.remove()"><i class="fas fa-trash"></i></button></td>
            `;
            tbody.appendChild(tr);
        });
    }

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
    const galleryFileInput = document.getElementById('galleryFileInput');

    if (addPhotoBtn) {
        addPhotoBtn.onclick = () => {
            // Open the file explorer dialog
            if (galleryFileInput) {
                galleryFileInput.click();
            } else {
                // Fallback: ask for URL
                const url = prompt('Enter image URL:');
                if (url) uploadPhotoUrl(url);
            }
        };
    }

    if (galleryFileInput) {
        galleryFileInput.addEventListener('change', async (e) => {
            const files = Array.from(e.target.files);
            if (!files.length) return;

            for (const file of files) {
                // Since we can't upload to Firebase Storage without extra setup,
                // we store the file name as the URL so it works with local images
                // in the same directory, or we create an object URL as a preview.
                const localUrl = file.name; // store just filename — must be in website folder
                await uploadPhotoUrl(localUrl, file.name);
            }

            // Reset input so same files can be selected again
            galleryFileInput.value = '';
        });
    }

    async function uploadPhotoUrl(url, caption = '') {
        try {
            await push(ref(db, 'gallery'), {
                url: url,
                caption: caption,
                timestamp: serverTimestamp()
            });
            await logActivity('Added a new photo to the gallery.');
        } catch (error) {
            console.error('Add photo error', error);
            alert('Failed to add photo. Make sure Firebase is connected.');
        }
    }

    // Initializations
    initMessageListener();
    initLiveStats();
    initAcademicsListener();
    initNewsListener();
    initGalleryListener();
});
