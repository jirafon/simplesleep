#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const buildPath = path.join(__dirname, '../../client/build');
const indexPath = path.join(buildPath, 'index.html');

console.log('\n📦 Verifying React build...');
console.log('   Build path:', buildPath);
console.log('   Build exists:', fs.existsSync(buildPath));
console.log('   index.html exists:', fs.existsSync(indexPath));

if (!fs.existsSync(buildPath)) {
  console.error('\n❌ ERROR: Build folder not found at', buildPath);
  console.error('   Make sure you ran: cd client && npm run build');
  process.exit(1);
}

if (!fs.existsSync(indexPath)) {
  console.error('\n❌ ERROR: index.html not found at', indexPath);
  console.error('   The React build may have failed.');
  
  // List what's actually in the build folder
  console.log('\n   Contents of build folder:');
  try {
    const files = fs.readdirSync(buildPath);
    files.forEach(file => {
      const stat = fs.statSync(path.join(buildPath, file));
      console.log(`     ${stat.isDirectory() ? '📁' : '📄'} ${file}`);
    });
  } catch (err) {
    console.log('   Could not read build folder:', err.message);
  }
  process.exit(1);
}

// Check for static folder
const staticPath = path.join(buildPath, 'static');
if (!fs.existsSync(staticPath)) {
  console.warn('\n⚠️  WARNING: static folder not found in build');
}

console.log('\n✅ Build verification passed!');
console.log('   Ready to serve frontend from', buildPath);
