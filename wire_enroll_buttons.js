// wire_enroll_buttons.js — Update all Enroll Now buttons to point to enroll.html
const fs = require('fs');

const filesToPatch = [
    'index.html',
    'about.html',
    'academics.html',
    'campus-life.html',
    'news-events.html',
    'gallery.html',
    'contact.html',
    'admissions.html'
];

let patchCount = 0;

filesToPatch.forEach(file => {
    if (!fs.existsSync(file)) return;
    let html = fs.readFileSync(file, 'utf8');

    const before = html;

    // Fix navbar "Enroll Now" button (various patterns)
    html = html.replace(
        /onclick="window\.location\.href='admissions\.html'"/g,
        "onclick=\"window.location.href='enroll.html'\""
    );

    // Also handle any bare href patterns
    html = html.replace(
        /<button class="enroll-btn">/g,
        '<button class="enroll-btn" onclick="window.location.href=\'enroll.html\'">'
    );

    if (html !== before) {
        fs.writeFileSync(file, html, 'utf8');
        patchCount++;
        console.log(`${file}: Enroll Now button updated.`);
    } else {
        console.log(`${file}: No change needed.`);
    }
});

// Also update admissions.html "Apply Now" CTA if present
let admHtml = fs.readFileSync('admissions.html', 'utf8');
if (admHtml.includes('admissionsForm') && !admHtml.includes('enroll.html')) {
    // Add a prominent "Start Full Application" link next to the inquiry form header
    admHtml = admHtml.replace(
        '<h2>Admission Application</h2>',
        '<h2>Admission Application</h2>\n                    <p style="margin-top:10px;"><a href="enroll.html" style="display:inline-block;background:linear-gradient(135deg,#2563eb,#1e40af);color:#fff;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:700;font-size:16px;margin-top:8px;"><i class="fas fa-file-signature" style="margin-right:8px;"></i>Open Full Enrollment Form</a></p>'
    );
    fs.writeFileSync('admissions.html', admHtml, 'utf8');
    console.log('admissions.html: Full enrollment CTA added.');
}

console.log(`\nDone! Patched ${patchCount} files.`);
