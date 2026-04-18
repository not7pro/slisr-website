const fs = require('fs');
let js = fs.readFileSync('admin.js', 'utf8');

const appsLogic = `
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
                html += \`
                    <div class="inbox-item \${isNew ? 'unread' : ''}" onclick="viewApplication('\${app.id}')" id="app_\${app.id}">
                        <div class="item-header">
                            <h4>\${app.studentName}</h4>
                            <span class="time">\${time}</span>
                        </div>
                        <div class="item-subject">Grade: \${app.grade}</div>
                        <div class="item-preview">Parent: \${app.parentName}</div>
                    </div>
                \`;
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

        viewer.innerHTML = \`
            <div class="view-header">
                <div class="user-info-large">
                    <img src="https://ui-avatars.com/api/?name=\${app.studentName}&background=random" class="avatar-large" alt="">
                    <div class="user-meta">
                        <h2>\${app.studentName} \${app.grade ? '- ' + app.grade : ''}</h2>
                        <p>Parent: \${app.parentName} &bull; \${app.email} &bull; \${app.phone}</p>
                    </div>
                </div>
                <div class="view-actions" style="display: flex; gap: 10px; align-items: center;">
                    <a href="https://mail.google.com/mail/?view=cm&fs=1&to=\${encodeURIComponent(app.email)}&su=Re:%20Admission%20Application%20for%20\${encodeURIComponent(app.studentName)}&body=\${encodeURIComponent('Dear ' + app.parentName + ',\\n\\nThank you for applying to Sri Lankan International School Riyadh.\\n\\n')}" target="_blank" class="reply-btn" style="text-decoration: none; padding: 8px 15px; font-size: 13px;"><i class="fas fa-reply"></i> Reply via Gmail</a>
                    <button class="icon-btn-delete" title="Archive Application" onclick="deleteApplication('\${app.id}')" style="background:#fee2e2; color:#ef4444; border:none; width:40px; height:40px; border-radius:8px; cursor:pointer;"><i class="fas fa-check"></i></button>
                </div>
            </div>
            <div class="view-body" style="font-size: 16px; line-height: 1.8; color: #334155;">
                <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                    <h3 style="margin-bottom: 15px; color: #0f172a;">Application Details</h3>
                    <p><strong>Applying Grade:</strong> \${app.grade}</p>
                    <p><strong>Previous School:</strong> \${app.prevSchool || 'N/A'}</p>
                    <p><strong>Submitted:</strong> \${time}</p>
                </div>
                <h4 style="margin-bottom: 10px; color: #0f172a;">Additional Notes / Medical Info:</h4>
                <p style="white-space: pre-wrap; margin-left: 5px;">\${app.notes || 'No additional notes provided.'}</p>
            </div>
        \`;
    };

    window.deleteApplication = async function(id) {
        if (confirm('Mark this application as processed and archive it?')) {
            try {
                await remove(ref(db, 'applications/' + id));
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
`;

// Insert the block just above the updateStats function which is clean
js = js.replace('function updateStats() {', appsLogic + '\n    function updateStats() {');

fs.writeFileSync('admin.js', js, 'utf8');
console.log("Admin JS patched with Applications Listener.");
