const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir('./app/api', function (filePath) {
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        if (content.includes("process.env.NEXT_PUBLIC_SUPABASE_URL || ''")) {
            content = content.replace(/process\.env\.NEXT_PUBLIC_SUPABASE_URL\s*\|\|\s*''/g, "process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'");
            modified = true;
        }
        if (content.includes("process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''")) {
            content = content.replace(/process\.env\.NEXT_PUBLIC_SUPABASE_ANON_KEY\s*\|\|\s*''/g, "process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key'");
            modified = true;
        }
        if (content.includes("process.env.SUPABASE_SERVICE_ROLE_KEY || ''")) {
            content = content.replace(/process\.env\.SUPABASE_SERVICE_ROLE_KEY\s*\|\|\s*''/g, "process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_key'");
            modified = true;
        }

        if (modified) {
            fs.writeFileSync(filePath, content);
            console.log('Fixed ' + filePath);
        }
    }
});
