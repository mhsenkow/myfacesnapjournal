#!/bin/bash

# MyFace SnapJournal - App Build Script
# This script builds the desktop app for your current platform

echo "🚀 Building MyFace SnapJournal Desktop App"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
fi

# Check if Tauri CLI is installed
if ! command -v cargo-tauri &> /dev/null; then
    echo "📦 Installing Tauri CLI..."
    cargo install tauri-cli
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install Tauri CLI"
        exit 1
    fi
fi

echo "🔨 Building frontend..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi

echo "📱 Building desktop app..."
npm run tauri:build
if [ $? -ne 0 ]; then
    echo "❌ Desktop app build failed"
    exit 1
fi

echo ""
echo "🎉 Build complete!"
echo ""
echo "📦 Your app is ready in:"
echo "   src-tauri/target/release/bundle/"
echo ""
echo "🖥️  Platform-specific files:"
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "   macOS: .app and .dmg files"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "   Linux: .AppImage and .deb files"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    echo "   Windows: .exe and .msi files"
fi
echo ""
echo "🚀 Ready to distribute!"
