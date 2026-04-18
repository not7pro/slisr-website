const fs = require('fs');

let html = fs.readFileSync('admin.html', 'utf8');

// Insert viewport tag under charset
html = html.replace('<meta charset="UTF-8">', '<meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">');

fs.writeFileSync('admin.html', html, 'utf8');
console.log("Viewport meta tag inserted.");
