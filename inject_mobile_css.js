const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\Arshad';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
let patched = [], skipped = [], failed = [];

files.forEach(file => {
    const fp = path.join(dir, file);
    try {
        let content = fs.readFileSync(fp, 'utf-8');
        if (content.includes('mobile.css')) {
            skipped.push(file);
            return;
        }
        // Insert mobile.css right before </head>
        const updated = content.replace('</head>', '    <link rel="stylesheet" href="mobile.css">\n</head>');
        if (updated === content) {
            failed.push(file + ' (no </head> found)');
            return;
        }
        fs.writeFileSync(fp, updated, 'utf-8');
        patched.push(file);
    } catch(e) {
        failed.push(file + ': ' + e.message);
    }
});

console.log('Patched:', patched.join(', '));
console.log('Skipped (already had it):', skipped.join(', '));
if (failed.length) console.log('Failed:', failed.join(', '));
