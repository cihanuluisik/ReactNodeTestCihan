#!/bin/bash

# Client Management Script
# Usage: ./client.sh [up|down|status|restart]

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

# Function to check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
}

# Function to check if npm is installed
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
}

# Function to check if port is available
check_port() {
    local port=$1
    if lsof -i :$port > /dev/null 2>&1; then
        print_warning "Port $port is already in use. Trying port $((port + 1))"
        return 1
    fi
    return 0
}

# Function to clear ports 3000-3003
clear_ports() {
    local silent=${1:-false}
    
    if [ "$silent" != "true" ]; then
        print_status "Clearing ports 3000-3003..."
    fi
    
    for port in 3000 3001 3002 3003; do
        if lsof -i :$port > /dev/null 2>&1; then
            if [ "$silent" != "true" ]; then
                print_warning "Port $port is in use. Clearing..."
            fi
            # Kill processes using this port
            lsof -ti :$port | xargs kill -9 2>/dev/null || true
            sleep 2
        fi
    done
    # Wait a bit more to ensure processes are fully terminated
    sleep 1
    
    if [ "$silent" != "true" ]; then
        print_success "Ports 3000-3003 cleared successfully!"
    fi
}

# Function to find available port
find_available_port() {
    local start_port=3000
    local port=$start_port
    
    # Clear ports first (silently)
    clear_ports true
    
    # Now find the first available port starting from 3000
    for port in 3000 3001 3002 3003; do
        if ! lsof -i :$port > /dev/null 2>&1; then
            echo $port
            return 0
        fi
    done
    
    # If all ports 3000-3003 are still in use, try higher ports
    port=3004
    while [ $port -le 3010 ]; do
        if ! lsof -i :$port > /dev/null 2>&1; then
            echo $port
            return 0
        fi
        port=$((port + 1))
    done
    
    print_error "No available ports found between 3000 and 3010"
    exit 1
}

# Function to start React app
start_client() {
    # Check if package.json exists
    if [ ! -f "$SCRIPT_DIR/Client/package.json" ]; then
        print_error "Client/package.json not found. Please ensure the Client directory exists."
        exit 1
    fi
    
    # Clear ports and find available port
    PORT=$(find_available_port)
    print_status "Port: $PORT"
    print_status "Framework: React"
    
    # Check if client is already running (but only for our project)
    if [ -f "$SCRIPT_DIR/Client/.client.pid" ]; then
        CLIENT_PID=$(cat "$SCRIPT_DIR/Client/.client.pid")
        if kill -0 $CLIENT_PID 2>/dev/null; then
            print_warning "React application is already running."
            # Get port from file
            if [ -f "$SCRIPT_DIR/Client/.client.port" ]; then
                PORT=$(cat "$SCRIPT_DIR/Client/.client.port")
                print_status "React app URLs:"
                echo "  - App: http://localhost:$PORT"
            fi
            return 0
        fi
    fi
    
    # Navigate to Client directory
    cd "$SCRIPT_DIR/Client"
    
    # Check if node_modules exists, install if not
    if [ ! -d "node_modules" ]; then
        print_status "Installing npm dependencies..."
        npm install
    fi
    
    # Start the React app in background (non-interactive)
    print_status "Launching React application..."
    echo "y" | PORT=$PORT npm start > /tmp/react-start.log 2>&1 &
    CLIENT_PID=$!
    
    # Wait for app to start
    print_status "Waiting for React app to start..."
    sleep 30
    
    # Check if React app is running by testing the connection
    if curl -s http://localhost:$PORT/ > /dev/null 2>&1; then
        print_success "React application started successfully!"
        print_status "Client PID: $CLIENT_PID"
        echo $CLIENT_PID > .client.pid
        echo $PORT > .client.port
        print_status "React app URLs:"
        echo "  - App: http://localhost:$PORT"
        echo "  - Development: http://localhost:$PORT"
    else
        # Check if it's still compiling
        if grep -q "webpack compiled" /tmp/react-start.log 2>/dev/null; then
            print_success "React application compiled successfully!"
            print_status "Client PID: $CLIENT_PID"
            echo $CLIENT_PID > .client.pid
            echo $PORT > .client.port
            print_status "React app URLs:"
            echo "  - App: http://localhost:$PORT"
            echo "  - Development: http://localhost:$PORT"
        else
            print_error "Failed to start React application. Check logs above."
            print_status "React startup log:"
            tail -10 /tmp/react-start.log 2>/dev/null || echo "No log file found"
            # Clean up if failed
            kill $CLIENT_PID 2>/dev/null || true
            exit 1
        fi
    fi
}

# Function to stop React app
stop_client() {
    # Try to stop by PID file first
    if [ -f "$SCRIPT_DIR/Client/.client.pid" ]; then
        CLIENT_PID=$(cat "$SCRIPT_DIR/Client/.client.pid")
        if kill -0 $CLIENT_PID 2>/dev/null; then
            kill $CLIENT_PID
            print_success "React application stopped successfully!"
        else
            print_warning "Client PID file exists but process not found."
        fi
        rm -f "$SCRIPT_DIR/Client/.client.pid"
        rm -f "$SCRIPT_DIR/Client/.client.port"
    fi
    
    # Also try to kill any react-scripts processes
    if pgrep -f "react-scripts start" > /dev/null; then
        pkill -f "react-scripts start"
        print_success "React application processes stopped!"
    fi
}

# Function to open in browser
open_browser() {
    local port=$1
    if command -v open &> /dev/null; then
        print_status "Opening React app in default browser..."
        open http://localhost:$port
    elif command -v xdg-open &> /dev/null; then
        print_status "Opening React app in default browser..."
        xdg-open http://localhost:$port
    else
        print_warning "Could not automatically open browser. Please manually navigate to:"
        echo "  http://localhost:$port"
    fi
}

# Function to start everything
start_all() {
    print_status "Starting React application..."
    echo ""
    
    check_node
    check_npm
    
    start_client
    echo ""
    
    # Get the port from file or default
    PORT=3000
    if [ -f "$SCRIPT_DIR/Client/.client.port" ]; then
        PORT=$(cat "$SCRIPT_DIR/Client/.client.port")
    fi
    
    print_status "🌐 Access Points:"
    echo "  ⚛️  React App: http://localhost:$PORT"
    echo "  🔧 Development: http://localhost:$PORT"
    echo ""
    print_status "To stop the application, run: ./client.sh down"
    echo ""
    print_status "Opening in browser..."
    open_browser $PORT
}

# Function to stop everything
stop_all() {
    print_status "Stopping React application..."
    
    stop_client
}

# Function to show status
show_status() {
    print_status "Checking React application status..."
    
    echo ""
    echo "React Application Status:"
    
    # Check if PID file exists
    if [ -f "$SCRIPT_DIR/Client/.client.pid" ]; then
        CLIENT_PID=$(cat "$SCRIPT_DIR/Client/.client.pid")
        if kill -0 $CLIENT_PID 2>/dev/null; then
            echo "  React app is running (PID: $CLIENT_PID)"
            
            # Get port from file
            if [ -f "$SCRIPT_DIR/Client/.client.port" ]; then
                PORT=$(cat "$SCRIPT_DIR/Client/.client.port")
                echo ""
                echo "React App URLs:"
                echo "  ⚛️  App: http://localhost:$PORT"
                echo "  🔧 Development: http://localhost:$PORT"
            fi
        else
            echo "  React app PID file exists but process not running"
        fi
    else
        echo "  React app not running"
    fi
    
    # Check for any react-scripts processes
    if pgrep -f "react-scripts start" > /dev/null; then
        echo "  React-scripts process found"
    fi
    
    # Check common React ports
    echo ""
    echo "Port Status:"
    for port in 3000 3001 3002 3003; do
        if lsof -i :$port > /dev/null 2>&1; then
            echo "  Port $port: In use"
        else
            echo "  Port $port: Available"
        fi
    done
}

# Function to restart
restart_client() {
    print_status "Restarting React application..."
    stop_all
    sleep 2
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
        restart_client
        ;;
    "open")
        # Get port and open browser
        PORT=3000
        if [ -f "$SCRIPT_DIR/Client/.client.port" ]; then
            PORT=$(cat "$SCRIPT_DIR/Client/.client.port")
        fi
        open_browser $PORT
        ;;
    "clear-ports")
        clear_ports
        ;;
    *)
        echo "Usage: $0 {up|down|status|restart|open|clear-ports}"
        echo ""
        echo "Commands:"
        echo "  up          - Start React application"
        echo "  down        - Stop React application"
        echo "  status      - Show status of React application"
        echo "  restart     - Restart React application"
        echo "  open        - Open React app in browser"
        echo "  clear-ports - Clear ports 3000-3003"
        echo ""
        echo "Examples:"
        echo "  ./client.sh up"
        echo "  ./client.sh down"
        echo "  ./client.sh status"
        echo "  ./client.sh open"
        echo "  ./client.sh clear-ports"
        exit 1
        ;;
esac 