const fs = require('fs');

const cssFiles = fs.readdirSync('.').filter(f => f.endsWith('.css'));

cssFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf-8');
    
    // Using a more robust regex to replace height within the .logo-img block
    // It captures up to the 'height: ' part, then replaces 140px with 70px
    content = content.replace(/(\.logo-img\s*\{[^}]*?height:\s*)140px/g, '$170px');
    content = content.replace(/(\.logo-img\s*\{[^}]*?height:\s*)120px/g, '$170px');
    
    // Also update mobile media query styles for .logo-img
    content = content.replace(/(\.logo-img[^{]*\{[^}]*?height:\s*)100px/g, '$160px');
    content = content.replace(/(\.logo-img[^{]*\{[^}]*?height:\s*)80px/g, '$160px');
    
    fs.writeFileSync(file, content);
});

console.log('Update complete');
