#!/bin/bash

# MyFace SnapJournal - Quick Setup Script
# This script helps users get started quickly

echo "🚀 MyFace SnapJournal - Quick Setup"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js 18+ from: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version is too old! Current: $(node -v)"
    echo "Please upgrade to Node.js 18+ from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if Rust is installed
if ! command -v rustc &> /dev/null; then
    echo "❌ Rust is not installed!"
    echo "Please install Rust from: https://rustup.rs/"
    exit 1
fi

echo "✅ Rust $(rustc --version) detected"

# Check if Tauri CLI is installed
if ! command -v cargo-tauri &> /dev/null; then
    echo "📦 Installing Tauri CLI..."
    cargo install tauri-cli
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install Tauri CLI"
        echo "Please run: cargo install tauri-cli"
        exit 1
    fi
fi

echo "✅ Tauri CLI detected"

# Install npm dependencies
echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp env.example .env
    echo "✅ .env file created (edit as needed)"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "🚀 To start development:"
echo "   npm run dev"
echo ""
echo "🖥️  To run the desktop app:"
echo "   npm run tauri:dev"
echo ""
echo "📖 For more info, see README.md"
echo ""
echo "Happy journaling! ✨"
