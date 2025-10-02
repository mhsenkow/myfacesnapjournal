#!/bin/bash

# MyFace SnapJournal - Development Setup Script
# This script sets up the development environment for the project

echo "🚀 Setting up MyFace SnapJournal development environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if Rust is installed
if ! command -v cargo &> /dev/null; then
    echo "❌ Rust is not installed. Please install Rust 1.70+ first."
    echo "Visit: https://rustup.rs/"
    exit 1
fi

echo "✅ Rust version: $(cargo --version)"

# Check if Tauri CLI is installed
if ! command -v tauri &> /dev/null; then
    echo "📦 Installing Tauri CLI..."
    cargo install tauri-cli
fi

echo "✅ Tauri CLI version: $(tauri --version)"

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Install Rust dependencies
echo "📦 Installing Rust dependencies..."
cd src-tauri
cargo build
cd ..

# Create necessary directories
echo "📁 Creating project directories..."
mkdir -p src/database
mkdir -p src/services
mkdir -p src/types
mkdir -p src/utils

# Set up environment
echo "🔧 Setting up environment..."

# Check if Ollama is available
if command -v ollama &> /dev/null; then
    echo "✅ Ollama is available"
else
    echo "⚠️  Ollama is not installed. AI features will be limited."
    echo "Install from: https://ollama.ai/"
fi

echo ""
echo "🎉 Development environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Start the development server: npm run tauri dev"
echo "2. Open the app in your browser at http://localhost:1420"
echo "3. Check the README.md for more information"
echo ""
echo "Happy coding! 🚀"
