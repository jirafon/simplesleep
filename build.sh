#!/bin/bash

echo "🔨 Building Siempresalud for Production..."
echo ""

# Step 1: Install server dependencies
echo "📦 Step 1: Installing server dependencies..."
cd server
npm install
if [ $? -ne 0 ]; then
  echo "❌ Server npm install failed"
  exit 1
fi
cd ..
echo "✅ Server dependencies installed"
echo ""

# Step 2: Install client dependencies
echo "📦 Step 2: Installing client dependencies..."
cd client
npm install
if [ $? -ne 0 ]; then
  echo "❌ Client npm install failed"
  exit 1
fi
echo "✅ Client dependencies installed"
echo ""

# Step 3: Build React app
echo "🔨 Step 3: Building React app..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ React build failed"
  exit 1
fi
echo "✅ React app built successfully"
echo ""

# Step 4: Verify build
echo "✔️  Step 4: Verifying build..."
if [ ! -f "build/index.html" ]; then
  echo "❌ Build failed: index.html not found"
  echo "   Build contents:"
  ls -la build/
  exit 1
fi
echo "✅ Build verified: index.html found"
echo ""

cd ..

# Step 5: Verify server can find build
echo "📂 Step 5: Verifying server can access build..."
node server/scripts/verify-build.js
if [ $? -ne 0 ]; then
  echo "❌ Build verification failed"
  exit 1
fi
echo ""

echo "🎉 Build complete! Ready for deployment."
