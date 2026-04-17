const fs = require('fs');

try {
    // 1. admin.js
    let admin = fs.readFileSync('admin.js', 'utf8');
    admin = admin.replace(/currentMessages\.reverse\(\);\s*\}\);/g, "currentMessages.reverse();");
    admin = admin.replace(/const data = doc\.val\(\);[\r\n\s]*const data = doc\.data\(\);/g, "const data = doc.val();");
    admin = admin.replace(/const data = doc\.data\(\);/g, "const data = doc.val();");
    fs.writeFileSync('admin.js', admin, 'utf8');
    
    // 2. news-events.js
    let news = fs.readFileSync('news-events.js', 'utf8');
    news = news.replace(/id: doc\.id, \.\.\.doc\.data\(\)/g, "id: doc.key, ...doc.val()");
    news = news.replace(/item\.timestamp\.seconds \* 1000/g, "item.timestamp");
    fs.writeFileSync('news-events.js', news, 'utf8');
    
    // 3. admissions.js
    let adm = fs.readFileSync('admissions.js', 'utf8');
    adm = adm.replace(/const data = doc\.data\(\);/g, "const data = doc.val();");
    fs.writeFileSync('admissions.js', adm, 'utf8');
    
    console.log("All syntax errors and variables fixed successfully.");
} catch(e) {
    console.error("Error fixing scripts:", e);
}
