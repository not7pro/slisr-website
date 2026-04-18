const fs = require('fs');

let css = fs.readFileSync('admin.css', 'utf8');

// Fix the syntax error causing the layout to break
css = css.replace(/    overflow-y: auto;\r?\n    overflow-y: auto;`n\}/g, '    overflow-y: auto;\n}');

// Just in case it looks different
css = css.replace(/    overflow-y: auto;`n\}/g, '}');

fs.writeFileSync('admin.css', css, 'utf8');
console.log("CSS syntax error repaired.");
