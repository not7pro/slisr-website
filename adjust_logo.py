import os
import re

css_files = [f for f in os.listdir('.') if f.endswith('.css')]

for file in css_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
        
    original = content
    
    # 1. Navbar logo img
    # Look for .logo-img { ... height: 100px; ... }
    content = re.sub(r'(\.logo-img\s*\{[^}]*?height:\s*)100px', r'\g<1>140px', content)
    
    # Mobile logo img: .logo-img { ... height: 70px; ... } 
    # and footer logo: .footer-logo { ... height: 70px; ... }
    content = re.sub(r'(\.logo-img\s*\{[^}]*?height:\s*)70px', r'\g<1>100px', content)
    content = re.sub(r'(\.footer-logo\s*\{[^}]*?height:\s*)70px', r'\g<1>120px', content)
    
    # 2. Loader logo
    # .loader-logo { width: 250px; height: 250px; ... }
    content = re.sub(r'(\.loader-logo\s*\{[^}]*?width:\s*)250px', r'\g<1>350px', content)
    content = re.sub(r'(\.loader-logo\s*\{[^}]*?height:\s*)250px', r'\g<1>350px', content)
    
    # 3. Sidebar logo (admin)
    content = re.sub(r'(\.sidebar-logo\s*\{[^}]*?width:\s*)60px', r'\g<1>90px', content)
    content = re.sub(r'(\.sidebar-logo\s*\{[^}]*?margin-bottom:\s*)10px', r'\g<1>20px', content)

    # 4. Login logo (admin)
    content = re.sub(r'(\.login-logo\s*\{[^}]*?width:\s*)120px', r'\g<1>160px', content)
    
    if content != original:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file}")
