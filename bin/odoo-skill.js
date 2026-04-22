#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const PACKAGE_ROOT = path.join(__dirname, '..');
const DEST_DIR = path.join(process.cwd(), '.odoo-skill');

function copyRecursiveSync(src, dest) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();
    
    if (isDirectory) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        fs.readdirSync(src).forEach(function(childItemName) {
            copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

const args = process.argv.slice(2);
const command = args[0];

if (command === 'init') {
    console.log('📦 Installing Odoo AI Skill to ' + DEST_DIR + ' ...');
    
    if (!fs.existsSync(DEST_DIR)) {
        fs.mkdirSync(DEST_DIR, { recursive: true });
    }

    const folders = ['examples', 'rules', 'skills', 'templates'];
    const files = ['AGENTS.md', 'README.md', 'SKILL.md'];

    folders.forEach(folder => {
        const src = path.join(PACKAGE_ROOT, folder);
        if (fs.existsSync(src)) {
            copyRecursiveSync(src, path.join(DEST_DIR, folder));
        }
    });

    files.forEach(file => {
        const src = path.join(PACKAGE_ROOT, file);
        if (fs.existsSync(src)) {
            fs.copyFileSync(src, path.join(DEST_DIR, file));
        }
    });

    console.log('✅ Odoo Skill successfully installed in .odoo-skill/\n');
    
    console.log('💡 Next steps to configure your AI Assistant:');
    console.log('-------------------------------------------');
    console.log('🔹 Cursor IDE:');
    console.log('   Create a .cursorrules file in your project root with:');
    console.log('   "Always read the rules in .odoo-skill/SKILL.md before answering."\n');
    console.log('🔹 Windsurf (Cascade):');
    console.log('   Create a .windsurfrules file in your project root with:');
    console.log('   "Always read the rules in .odoo-skill/SKILL.md before answering."\n');
    console.log('🔹 Claude Code / Copilot:');
    console.log('   Just tell the AI to read .odoo-skill/SKILL.md on your first prompt.');
    
} else {
    console.log('Usage: npx odoo-skill init');
    console.log('This will copy the odoo-skill knowledge base into a .odoo-skill folder in your current directory.');
}
