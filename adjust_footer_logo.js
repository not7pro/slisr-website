const fs = require('fs');

const cssFiles = fs.readdirSync('.').filter(f => f.endsWith('.css'));

cssFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf-8');
    
    // Update footer-logo height
    content = content.replace(/(\.footer-brand[^{]*\.footer-logo\s*\{[^}]*?height:\s*)\d+px/g, '$180px');
    
    fs.writeFileSync(file, content);
});

console.log('Footer logo updated');
