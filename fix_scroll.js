const fs = require('fs');

let css = fs.readFileSync('admin.css', 'utf8');

// The ultimate fix for the dashboard flexbox clipping issues:
// We ensure the message viewer enforces its boundaries and only the text body scrolls.

const oldViewer = `.message-viewer {
    display: flex;
    flex-direction: column;
    padding: 40px;
    background: #fff;
    overflow-y: auto;
}`;

const newViewer = `.message-viewer {
    display: flex;
    flex-direction: column;
    padding: 30px;
    background: #fff;
    overflow: hidden;
}`;

const oldBody = `.view-body {
    margin-bottom: 30px;
    font-size: 16px;
    line-height: 1.8;
    color: #334155;
    overflow-y: auto;
}`;

const newBody = `.view-body {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 20px;
    padding-right: 15px;
    font-size: 16px;
    line-height: 1.8;
    color: #334155;
}`;

const oldFooter = `.view-footer {
    border-top: 1px solid var(--border-color);
    padding-top: 30px;
    display: flex;
    gap: 15px;
}`;

const newFooter = `.view-footer {
    border-top: 1px solid var(--border-color);
    padding-top: 20px;
    display: flex;
    gap: 15px;
    flex-shrink: 0;
}`;

if (css.includes('.message-viewer {')) {
    css = css.replace(/.*?\.message-viewer\s*\{[^}]+\}/, newViewer);
}
if (css.includes('.view-body {')) {
    css = css.replace(/.*?\.view-body\s*\{[^}]+\}/, newBody);
}
if (css.includes('.view-footer {')) {
    css = css.replace(/.*?\.view-footer\s*\{[^}]+\}/, newFooter);
}

// Add flex-shrink 0 to view-header as well so it never collapses
if (!css.includes('flex-shrink: 0;')) {
    css = css.replace('.view-header {', '.view-header {\n    flex-shrink: 0;');
}

fs.writeFileSync('admin.css', css, 'utf8');
console.log("Ultimate desktop app layout applied cleanly.");
