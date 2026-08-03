#!/bin/bash
set -e

echo "=== Render Build Script ==="
echo "Working directory: $(pwd)"
echo ""

echo "Step 1: Install server dependencies"
cd server
npm install --legacy-peer-deps
cd ..

echo ""
echo "Step 2: Install client dependencies"
cd client
npm install --legacy-peer-deps

echo ""
echo "Step 3: Build React app"
npm run build

echo ""
echo "Step 4: Ensure server/public directory exists"
cd ..
mkdir -p server/public

echo ""
echo "Step 5: Copy build files"
cp -r client/build/* server/public/

echo ""
echo "Step 6: Verify files copied"
ls -la server/public/ | head -20
echo ""
echo "Index.html exists: $(test -f server/public/index.html && echo 'YES' || echo 'NO')"

echo ""
echo "=== Build Complete ==="
