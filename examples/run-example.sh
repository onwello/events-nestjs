#!/bin/bash

echo "🚀 Starting Events NestJS Integration Example"
echo "=============================================="

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the project
echo "🔨 Building the project..."
npm run build

# Start the application
echo "🌟 Starting the application..."
echo "📊 Health check: http://localhost:3000/health"
echo "👤 Users API: http://localhost:3000/users"
echo "📦 Orders API: http://localhost:3000/orders"
echo ""
echo "Press Ctrl+C to stop the application"
echo ""

npm run start:dev
