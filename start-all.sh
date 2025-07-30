#!/bin/bash

# Full Stack Application Management Script
# Usage: ./start-all.sh [up|down|status|restart]

set -e  # Exit on any error

# Store the original directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to start everything
start_all() {
    print_status "Starting Full Stack Application..."
    echo ""
    
    # Start server first
    print_status "🚀 Starting Backend Services..."
    ./server.sh up
    echo ""
    
    # Wait a moment for server to be ready
    sleep 3
    
    # Start client
    print_status "⚛️  Starting Frontend Application..."
    ./client.sh up
    echo ""
    
    print_success "Full Stack Application Started Successfully!"
    echo ""
    print_status "🌐 All Access Points:"
    echo "  📊 MongoDB Database: mongodb://admin:admin123@localhost:27017/Prolink"
    echo "  🖥️  MongoDB Web UI: http://localhost:8081 (admin/admin123)"
    echo "  🚀 Node.js Server: http://localhost:5001"
    echo "  🔌 API Endpoints: http://localhost:5001/api"
    echo "  ⚛️  React App: http://localhost:3000 (or next available port)"
    echo ""
    print_status "To stop all services, run: ./start-all.sh down"
}

# Function to stop everything
stop_all() {
    print_status "Stopping Full Stack Application..."
    echo ""
    
    # Stop client first
    print_status "⚛️  Stopping Frontend Application..."
    ./client.sh down
    echo ""
    
    # Stop server
    print_status "🚀 Stopping Backend Services..."
    ./server.sh down
    echo ""
    
    print_success "Full Stack Application Stopped Successfully!"
}

# Function to show status
show_status() {
    print_status "Checking Full Stack Application Status..."
    echo ""
    
    print_status "🔧 Backend Services:"
    ./server.sh status
    echo ""
    
    print_status "⚛️  Frontend Application:"
    ./client.sh status
    echo ""
    
    print_status "📊 Summary:"
    echo "  - MongoDB: $(if docker ps | grep -q mongodb; then echo "✅ Running"; else echo "❌ Stopped"; fi)"
    echo "  - Node.js Server: $(if curl -s http://localhost:5001/ > /dev/null 2>&1; then echo "✅ Running"; else echo "❌ Stopped"; fi)"
    echo "  - React App: $(if curl -s http://localhost:3000/ > /dev/null 2>&1 || curl -s http://localhost:3001/ > /dev/null 2>&1 || curl -s http://localhost:3002/ > /dev/null 2>&1; then echo "✅ Running"; else echo "❌ Stopped"; fi)"
}

# Function to restart everything
restart_all() {
    print_status "Restarting Full Stack Application..."
    stop_all
    sleep 3
    start_all
}

# Main script logic
case "${1:-}" in
    "up")
        start_all
        ;;
    "down")
        stop_all
        ;;
    "status")
        show_status
        ;;
    "restart")
        restart_all
        ;;
    *)
        echo "Usage: $0 {up|down|status|restart}"
        echo ""
        echo "Commands:"
        echo "  up      - Start MongoDB, Node.js server, and React app"
        echo "  down    - Stop all services"
        echo "  status  - Show status of all services"
        echo "  restart - Restart all services"
        echo ""
        echo "Examples:"
        echo "  ./start-all.sh up"
        echo "  ./start-all.sh down"
        echo "  ./start-all.sh status"
        echo ""
        echo "Individual Scripts:"
        echo "  ./server.sh up|down|status  - Manage backend only"
        echo "  ./client.sh up|down|status  - Manage frontend only"
        exit 1
        ;;
esac 