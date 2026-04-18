const fs = require('fs');

const cssFiles = fs.readdirSync('.').filter(f => f.endsWith('.css'));

cssFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf-8');
    
    // Replace height within any .logo-img block (desktop) - safe inside the block
    content = content.replace(/(\.logo-img\s*\{[^}]*?height:\s*)\d+px/g, (match, prefix) => {
        // We can just set all of them to 70px. In the media query, setting to 70px is also fine,
        // since 70px is small enough for mobile as well. 
        // Or if it was 100 on mobile, make it 50px on mobile.
        // Let's decide based on original number: if original >= 100, make it 70px, else 50px.
        const num = parseInt(match.match(/\d+/)[0]);
        if (num >= 120) {
            return prefix + '70px';
        } else if (num === 100) {
            return prefix + '50px';
        } else {
            return prefix + '70px';
        }
    });

    fs.writeFileSync(file, content);
});

console.log('Update complete');
