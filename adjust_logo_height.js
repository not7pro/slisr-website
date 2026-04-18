const fs = require('fs');

const cssFiles = fs.readdirSync('.').filter(f => f.endsWith('.css'));

cssFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf-8');
    
    // Replace default height in .logo-img (e.g. 140px or whatever it is)
    // We can just find `.logo-img { \n height: ... `
    // using regex
    content = content.replace(/(\.logo-img\s*\{[\s\S]*?height:\s*)\d+px/g, (match, p1) => {
        // Here we see two cases: the main one (was 140px) and the media query one (was 100px).
        // Since we are globally replacing all occurrences, we need to be careful.
        return match; // fallback
    });
    
    // Simpler regex since we know the structure
    content = content.replace(/(\.logo-img\s*\{\s*height:\s*)140px/g, '$170px');
    content = content.replace(/(\.logo-img\s*\{\s*height:\s*)100px/g, '$150px');
    
    // For other files where it might be slightly different:
    // Let's just use replace with the exact string matches
    content = content.replace(/height: 140px;/g, 'height: 70px;');
    content = content.replace(/height: 100px;/g, 'height: 60px;');
    
    fs.writeFileSync(file, content);
});

console.log('Update complete');
