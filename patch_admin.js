const fs = require('fs');
let admin = fs.readFileSync('admin.js', 'utf8');

const oldBtn = `<button class="reply-btn" onclick="window.open('https://mail.google.com/mail/?view=cm&fs=1&to=\${encodeURIComponent(msg.email)}&su=Re:%20\${encodeURIComponent(msg.subject)}&body=\${encodeURIComponent('Hi ' + msg.firstName + ',\\n\\n')}', '_blank')"><i class="fas fa-reply"></i> Reply to Inquiry</button>`;

const newBtn = `<a href="https://mail.google.com/mail/?view=cm&fs=1&to=\${encodeURIComponent(msg.email)}&su=Re:%20\${encodeURIComponent(msg.subject)}&body=\${encodeURIComponent('Hi ' + msg.firstName + ',\\n\\n')}" target="_blank" class="reply-btn" style="text-decoration: none;"><i class="fas fa-reply"></i> Reply to Inquiry</a>`;

if (admin.includes(oldBtn)) {
    admin = admin.replace(oldBtn, newBtn);
    fs.writeFileSync('admin.js', admin, 'utf8');
    console.log('Successfully patched admin.js');
} else {
    console.log('Button string not found. Ensure exact match.');
}
