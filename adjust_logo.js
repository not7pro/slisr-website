const fs = require('fs');
const path = require('path');

const cssFiles = fs.readdirSync('.').filter(f => f.endsWith('.css'));

cssFiles.forEach(file => {
    const original = fs.readFileSync(file, 'utf8');
    let content = original;
    
    // Navbar logo
    content = content.replace(/(\.logo-img\s*\{[^}]*?height:\s*)100px/g, '$1140px');
    
    // Mobile and footer
    content = content.replace(/(\.logo-img\s*\{[^}]*?height:\s*)70px/g, '$1100px');
    content = content.replace(/(\.footer-logo\s*\{[^}]*?height:\s*)70px/g, '$1120px');
    content = content.replace(/(\.footer-brand \.footer-logo\s*\{[^}]*?height:\s*)70px/g, '$1120px');
    
    // Loader logo
    content = content.replace(/(\.loader-logo\s*\{[^}]*?width:\s*)250px/g, '$1350px');
    content = content.replace(/(\.loader-logo\s*\{[^}]*?height:\s*)250px/g, '$1350px');

    // Sidebar logo
    content = content.replace(/(\.sidebar-logo\s*\{[^}]*?width:\s*)60px/g, '$190px');
    content = content.replace(/(\.sidebar-logo\s*\{[^}]*?margin-bottom:\s*)10px/g, '$120px');

    // Login logo
    content = content.replace(/(\.login-logo\s*\{[^}]*?width:\s*)120px/g, '$1160px');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated', file);
    }
});
