const fs = require('fs');
let html = fs.readFileSync('admin.html', 'utf8');

// 1. Insert Sidebar Link
const newSidebarLink = `
                <a href="#" class="nav-item" data-section="applications">
                    <i class="fas fa-file-signature"></i>
                    <span>Applications</span>
                    <span class="badge" id="appBadge" style="display:none;">0</span>
                </a>`;
html = html.replace('<a href="#" class="nav-item" data-section="messages">', newSidebarLink + '\n                <a href="#" class="nav-item" data-section="messages">');

// 2. Insert Applications Section
const applicationsSectionHTML = `
            <!-- Applications Section -->
            <div id="applicationsSection" class="dashboard-section">
                <div class="messages-layout">
                    <div class="messages-sidebar">
                        <div class="search-box">
                            <i class="fas fa-search"></i>
                            <input type="text" placeholder="Search applications...">
                        </div>
                        <div class="inbox-list" id="appList">
                            <!-- Populated by JS -->
                        </div>
                    </div>
                    <div class="message-viewer" id="appViewer">
                        <div class="viewer-empty">
                            <i class="fas fa-file-alt"></i>
                            <p>Select an application to review</p>
                        </div>
                    </div>
                </div>
            </div>
`;
html = html.replace('<!-- Academics Section -->', applicationsSectionHTML + '\n            <!-- Academics Section -->');

fs.writeFileSync('admin.html', html, 'utf8');
console.log("Admin HTML Patched with Applications Section");
