#!/bin/bash

# Tunnel Setup Script for MyFace SnapJournal
# This script helps you expose your local Ollama server to the internet

echo "🌐 MyFace SnapJournal - Tunnel Setup"
echo "=================================="
echo ""

# Check if Ollama is running
echo "🔍 Checking if Ollama is running..."
if curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "✅ Ollama is running on localhost:11434"
else
    echo "❌ Ollama is not running. Please start Ollama first:"
    echo "   ollama serve"
    echo ""
    exit 1
fi

echo ""
echo "🚀 Starting tunnel with ngrok..."
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed. Installing..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew install ngrok/ngrok/ngrok
    else
        echo "Please install ngrok manually: https://ngrok.com/download"
        exit 1
    fi
fi

# Start ngrok tunnel
echo "🌐 Starting ngrok tunnel for Ollama..."
echo "   This will expose http://localhost:11434 to the internet"
echo ""

# Run ngrok in background
ngrok http 11434 --log=stdout > ngrok.log 2>&1 &
NGROK_PID=$!

# Wait a moment for ngrok to start
sleep 3

# Get the public URL
echo "🔗 Getting public URL..."
PUBLIC_URL=$(curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[0].public_url')

if [ "$PUBLIC_URL" != "null" ] && [ -n "$PUBLIC_URL" ]; then
    echo "✅ Tunnel is active!"
    echo "🌐 Public URL: $PUBLIC_URL"
    echo ""
    echo "📋 Copy this URL and paste it into the Ollama Settings in your app:"
    echo "   $PUBLIC_URL"
    echo ""
    echo "🛑 To stop the tunnel, press Ctrl+C"
    echo ""
    
    # Keep the script running
    trap "echo ''; echo '🛑 Stopping tunnel...'; kill $NGROK_PID; echo '✅ Tunnel stopped'; exit 0" INT
    
    # Wait for user to stop
    while true; do
        sleep 1
    done
else
    echo "❌ Failed to get public URL. Check ngrok.log for details."
    kill $NGROK_PID
    exit 1
fi
