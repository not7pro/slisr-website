// patch_all_pages.js - Inject analytics into all public HTML pages and fix dead buttons
const fs = require('fs');

const publicPages = [
    'index.html',
    'about.html',
    'academics.html',
    'campus-life.html',
    'news-events.html',
    'gallery.html',
    'contact.html',
    'admissions.html'
];

const analyticsTag = `    <script type="module" src="analytics.js"></script>`;

let patchedCount = 0;

publicPages.forEach(page => {
    if (!fs.existsSync(page)) {
        console.warn(`Skipping ${page} (not found)`);
        return;
    }
    let html = fs.readFileSync(page, 'utf8');

    // Skip if already injected
    if (html.includes('analytics.js')) {
        console.log(`${page}: analytics already present, skipping.`);
        return;
    }

    // Inject just before </body>
    html = html.replace('</body>', analyticsTag + '\n</body>');
    fs.writeFileSync(page, html, 'utf8');
    patchedCount++;
    console.log(`${page}: analytics.js injected.`);
});

// Fix index.html hero buttons
let indexHtml = fs.readFileSync('index.html', 'utf8');
indexHtml = indexHtml
    .replace(
        `<button class="btn btn-primary" id="virtualTourBtn">`,
        `<button class="btn btn-primary" id="virtualTourBtn" onclick="window.location.href='campus-life.html'">`
    )
    .replace(
        `<button class="btn btn-secondary" id="applyNowBtn">`,
        `<button class="btn btn-secondary" id="applyNowBtn" onclick="window.location.href='admissions.html'">`
    );
fs.writeFileSync('index.html', indexHtml, 'utf8');
console.log('index.html: Hero buttons wired.');

console.log(`\nDone! Patched ${patchedCount} pages.`);
