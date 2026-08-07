const fs = require('fs');
const path = require('path');

const filesToUpdate = [
    'src/pages/Dashboard/Dashboard.css',
    'src/components/DashboardNavbar/DashboardNavbar.css',
    'src/pages/Search/Search.css',
    'src/pages/PropertyDetail/PropertyDetail.css',
    'src/pages/Profile/Profile.css',
    'src/pages/MyProperties/MyProperties.css',
    'src/pages/PostProperty/PostProperty.css',
    'src/pages/MyProperties/components/OffersManagementModal.css'
];

const replacements = [
    // Backgrounds
    { search: /var\(--bg,\s*(#ffffff|#fff)\)/g, replace: 'var(--bg, #1e293b)' },
    { search: /var\(--bg-subtle,\s*#f8fafc\)/g, replace: 'var(--bg-subtle, #0f172a)' },
    { search: /var\(--bg-muted,\s*#f1f5f9\)/g, replace: 'var(--bg-muted, #334155)' },
    
    // Borders
    { search: /var\(--border,\s*#e2e8f0\)/g, replace: 'var(--border, #334155)' },
    { search: /var\(--border-light,\s*#f8fafc\)/g, replace: 'var(--border-light, #1e293b)' },
    
    // Text
    { search: /var\(--text,\s*#0f172a\)/g, replace: 'var(--text, #f8fafc)' },
    { search: /var\(--text-sub,\s*#334155\)/g, replace: 'var(--text-sub, #cbd5e1)' },
    { search: /var\(--text-muted,\s*#64748b\)/g, replace: 'var(--text-muted, #94a3b8)' },
    { search: /var\(--text-light,\s*#94a3b8\)/g, replace: 'var(--text-light, #64748b)' }
];

filesToUpdate.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        replacements.forEach(rule => {
            if (rule.search.test(content)) {
                content = content.replace(rule.search, rule.replace);
                modified = true;
            }
        });
        
        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated ${file}`);
        }
    } else {
        console.warn(`File not found: ${file}`);
    }
});
