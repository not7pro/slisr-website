// patch_dashboard_stats.js
// Injects live dashboard listeners for visitors, inquiries, events and activity log into admin.js
const fs = require('fs');

let js = fs.readFileSync('admin.js', 'utf8');

// 1. Patch the updateHeader to include Applications title
js = js.replace(
    `'gallery': { title: 'Gallery Management', sub: 'Manage school photos and social media links.' }`,
    `'gallery': { title: 'Gallery Management', sub: 'Manage school photos and social media links.' },
            'applications': { title: 'Applications Inbox', sub: 'Review and respond to student admission applications.' }`
);

// 2. Replace the stub updateStats function with a fully live version
const oldUpdateStats = `    function updateStats() {
        const inquiryStat = document.querySelector('.stats-grid .stat-card:nth-child(2) .number');
        if (inquiryStat) {
            inquiryStat.textContent = currentMessages.length;
        }
    }`;

const newUpdateStats = `    function updateStats() {
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
                return \`<div class="timeline-item">
                    <span class="time">\${when}</span>
                    <p>\${log.action}</p>
                </div>\`;
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
    window.logActivity = logActivity;`;

if (js.includes(oldUpdateStats)) {
    js = js.replace(oldUpdateStats, newUpdateStats);
    console.log('✓ updateStats replaced with live version + initLiveStats');
} else {
    console.warn('Could not find oldUpdateStats — check for whitespace differences');
}

// 3. Call initLiveStats() after the existing listener initialisations
// Find the initMessageListener() call and add initLiveStats() after
js = js.replace('    initMessageListener();', '    initMessageListener();\n    initLiveStats();');

// 4. Log activity when deleteMessage is called
js = js.replace(
    `await remove(ref(db, 'messages/' + id));`,
    `await remove(ref(db, 'messages/' + id));\n                await logActivity('Archived inquiry from a visitor.');`
);

// 5. Log activity when an application is deleted
js = js.replace(
    `await remove(ref(db, 'applications/' + id));`,
    `await remove(ref(db, 'applications/' + id));\n                await logActivity('Processed and archived a student application.');`
);

// 6. Log activity when fees are saved
js = js.replace(
    `alert('Success: Fee structure saved to database.');`,
    `alert('Success: Fee structure saved to database.');\n                logActivity('Updated the school tuition fee structure.');`
);

// 7. Wire the "New Post" / openNewsModalBtn
// This triggers scrolling to the news section. The modal open already exists in news section logic.
// We just ensure a global click handler exists.
if (!js.includes("openNewsModalBtn")) {
    js = js.replace(
        '    initMessageListener();',
        `    const openNewsModalBtn = document.getElementById('openNewsModalBtn');
    if (openNewsModalBtn) {
        openNewsModalBtn.addEventListener('click', () => {
            switchSection('news');
            setTimeout(() => {
                const addNewsBtn = document.getElementById('addNewsBtn');
                if (addNewsBtn) addNewsBtn.click();
            }, 200);
        });
    }
    initMessageListener();`
    );
}

fs.writeFileSync('admin.js', js, 'utf8');
console.log('admin.js patched with live dashboard stats and activity log!');
