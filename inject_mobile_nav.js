const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\Arshad';
// Public pages only (not admin, admin-login, seed-fees, under-construction, Removed Apps)
const publicPages = ['index.html','about.html','academics.html','admissions.html',
                     'campus-life.html','contact.html','enroll.html','gallery.html','news-events.html'];

let patched = [], skipped = [], failed = [];

publicPages.forEach(file => {
    const fp = path.join(dir, file);
    try {
        let content = fs.readFileSync(fp, 'utf-8');
        if (content.includes('mobile-nav.js')) { skipped.push(file); return; }

        // Insert before closing </body>
        const updated = content.replace('</body>', '    <script src="mobile-nav.js"></script>\n</body>');
        if (updated === content) { failed.push(file + ' (no </body>)'); return; }
        fs.writeFileSync(fp, updated, 'utf-8');
        patched.push(file);
    } catch(e) {
        failed.push(file + ': ' + e.message);
    }
});

console.log('Patched:', patched.join(', '));
console.log('Skipped:', skipped.join(', '));
if (failed.length) console.log('Failed:', failed.join(', '));
