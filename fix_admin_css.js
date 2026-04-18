const fs = require('fs');
let css = fs.readFileSync('c:\\Users\\Arshad\\admin.css', 'utf-8');

// Sidebar glassmorphism
css = css.replace(/background: var\(--dark-slate\);/g, 'background: rgba(15, 23, 42, 0.95);\n    backdrop-filter: blur(15px);\n    -webkit-backdrop-filter: blur(15px);\n    border-right: 1px solid rgba(255, 255, 255, 0.05);');

// Body background
css = css.replace(/background-color: var\(--bg-light\);/g, 'background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);\n    background-attachment: fixed;');

// Card styles enhancement
css = css.replace(/box-shadow: 0 4px 20px rgba\(0, 0, 0, 0\.03\);/g, 'box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);\n    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease;');

// Add hover to cards
if(!css.includes('.recent-card:hover')) {
    css += `\n
/* Enhanced Hover states for cards */
.stat-card:hover, .recent-card:hover, .cms-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
}\n`;
}

// Action button gradients
css = css.replace(/background: var\(--primary-blue\);/g, 'background: linear-gradient(135deg, var(--primary-blue) 0%, #1e40af 100%);');

// Update Save button (just in case it matches specifically)
css = css.replace(/\.save-btn \{\s*background: var\(--primary-blue\);/g, '.save-btn {\n    background: linear-gradient(135deg, var(--primary-blue) 0%, #1e40af 100%);');

// Enhance Modal Visuals
css = css.replace(/box-shadow: 0 25px 50px -12px rgba\(0, 0, 0, 0\.5\);/g, 'box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.4);\n    transform: scale(0.95);\n    animation: modalPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;');

if(!css.includes('@keyframes modalPop')) {
    css += `\n
@keyframes modalPop {
    to { transform: scale(1); }
}\n`;
}

// Ensure smooth nav link hover lift
css = css.replace(/\.nav-item:hover, \.nav-item\.active \{/g, '.nav-item:hover, .nav-item.active {\n    transform: translateX(4px);');

fs.writeFileSync('c:\\Users\\Arshad\\admin.css', css);
console.log('patched');
