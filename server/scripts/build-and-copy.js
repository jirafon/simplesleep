#!/usr/bin/env node

/**
 * Simple and reliable copy script for Render
 * Copies client/build to server/public
 */

const fs = require('fs');
const path = require('path');

// Get absolute paths - when run from server directory
const serverDir = __dirname.replace('/scripts', ''); // /path/to/server
const projectRoot = path.dirname(serverDir);         // /path/to/project
const clientBuild = path.join(projectRoot, 'client', 'build');
const serverPublic = path.join(serverDir, 'public');

console.log('\n' + '='.repeat(70));
console.log('📦 COPY FRONTEND BUILD TO SERVER/PUBLIC');
console.log('='.repeat(70));

console.log('\n🔍 Paths:');
console.log(`   __dirname: ${__dirname}`);
console.log(`   serverDir: ${serverDir}`);
console.log(`   projectRoot: ${projectRoot}`);
console.log(`   clientBuild: ${clientBuild}`);
console.log(`   serverPublic: ${serverPublic}`);

// Step 1: Check if client/build exists
console.log('\n✓ Step 1: Checking client/build...');
if (!fs.existsSync(clientBuild)) {
  console.error(`\n❌ ERROR: client/build not found at: ${clientBuild}`);
  console.error('   The React build was not created successfully.');
  process.exit(1);
}
console.log(`✓ client/build exists`);

// Step 2: Check if index.html exists in client/build
const clientIndexPath = path.join(clientBuild, 'index.html');
if (!fs.existsSync(clientIndexPath)) {
  console.error(`\n❌ ERROR: index.html not found at: ${clientIndexPath}`);
  const contents = fs.readdirSync(clientBuild).slice(0, 10);
  console.error(`   Contents of client/build: ${contents.join(', ')}`);
  process.exit(1);
}
console.log(`✓ index.html exists in client/build`);

// Step 3: Create server/public if it doesn't exist
console.log('\n✓ Step 2: Preparing server/public...');
if (!fs.existsSync(serverPublic)) {
  console.log(`   Creating directory: ${serverPublic}`);
  fs.mkdirSync(serverPublic, { recursive: true });
}
console.log(`✓ server/public is ready`);

// Step 4: Remove old files from server/public
console.log('\n✓ Step 3: Clearing old files from server/public...');
function removeDirectoryRecursive(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach(file => {
      const curPath = path.join(dirPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        removeDirectoryRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dirPath);
  }
}

try {
  const oldFiles = fs.readdirSync(serverPublic);
  let removedCount = 0;
  
  oldFiles.forEach(file => {
    const filePath = path.join(serverPublic, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      removeDirectoryRecursive(filePath);
      removedCount++;
    } else {
      fs.unlinkSync(filePath);
      removedCount++;
    }
  });
  
  if (removedCount > 0) {
    console.log(`   Removed ${removedCount} old items`);
  }
} catch (err) {
  console.warn(`   Warning: Could not clear old files: ${err.message}`);
}

// Step 5: Copy files
console.log('\n✓ Step 4: Copying files from client/build to server/public...');

let copiedFiles = 0;
let copiedDirs = 0;

function copyRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
    copiedDirs++;
  }
  
  const items = fs.readdirSync(src);
  
  items.forEach(item => {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    const stat = fs.statSync(srcPath);
    
    if (stat.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      copiedFiles++;
    }
  });
}

try {
  copyRecursive(clientBuild, serverPublic);
  console.log(`✓ Copy completed`);
  console.log(`   Files copied: ${copiedFiles}`);
  console.log(`   Directories created: ${copiedDirs}`);
} catch (err) {
  console.error(`\n❌ ERROR during copy: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
}

// Step 6: Verify the copy was successful
console.log('\n✓ Step 5: Verifying copy...');
const serverIndexPath = path.join(serverPublic, 'index.html');
if (!fs.existsSync(serverIndexPath)) {
  console.error(`\n❌ ERROR: index.html was not copied to server/public`);
  console.error(`   Expected: ${serverIndexPath}`);
  const contents = fs.readdirSync(serverPublic).slice(0, 10);
  console.error(`   Contents of server/public: ${contents.join(', ')}`);
  process.exit(1);
}

const sourceSize = fs.statSync(clientIndexPath).size;
const destSize = fs.statSync(serverIndexPath).size;

if (sourceSize !== destSize) {
  console.warn(`⚠️  WARNING: index.html sizes don't match`);
  console.warn(`   Source: ${sourceSize} bytes`);
  console.warn(`   Dest: ${destSize} bytes`);
}

console.log(`✓ server/public/index.html verified`);
console.log(`   Size: ${destSize} bytes`);

// Step 7: List some contents
console.log('\n✓ Step 6: Contents of server/public:');
const contents = fs.readdirSync(serverPublic).slice(0, 10);
contents.forEach(item => {
  const itemPath = path.join(serverPublic, item);
  const stat = fs.statSync(itemPath);
  if (stat.isDirectory()) {
    const subItems = fs.readdirSync(itemPath).length;
    console.log(`   📁 ${item}/ (${subItems} items)`);
  } else {
    console.log(`   📄 ${item} (${stat.size} bytes)`);
  }
});

console.log('\n' + '='.repeat(70));
console.log('✅ SUCCESS: Frontend copied to server/public');
console.log('='.repeat(70) + '\n');

process.exit(0);
