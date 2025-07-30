#!/bin/bash

# Server Management Script
# Usage: ./server.sh [up|down]

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

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
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

# Function to start MongoDB
start_mongodb() {
    print_status "Starting MongoDB..."
    print_status "Database: Prolink"
    print_status "Port: 27017"
    print_status "Web UI Port: 8081"
    
    if [ ! -d "Server/mongo-init" ]; then
        print_error "Server/mongo-init directory not found. Please ensure MongoDB setup is in place."
        exit 1
    fi
    
    cd Server/mongo-init
    
    # Check if containers are already running
    if docker-compose ps | grep -q "Up"; then
        print_warning "MongoDB containers are already running."
        print_status "MongoDB URLs:"
        echo "  - Database: mongodb://admin:admin123@localhost:27017/Prolink"
        echo "  - Web UI: http://localhost:8081 (admin/admin123)"
        return 0
    fi
    
    # Start MongoDB containers
    print_status "Launching MongoDB containers..."
    docker-compose up -d
    
    # Wait for MongoDB to be ready
    print_status "Waiting for MongoDB to be ready..."
    sleep 5
    
    # Test MongoDB connection
    if docker exec mongodb mongosh --eval "db.runCommand('ping')" > /dev/null 2>&1; then
        print_success "MongoDB started successfully!"
        print_status "MongoDB URLs:"
        echo "  - Database: mongodb://admin:admin123@localhost:27017/Prolink"
        echo "  - Web UI: http://localhost:8081 (admin/admin123)"
    else
        print_error "Failed to start MongoDB. Check logs with: cd Server/mongo-init && docker-compose logs"
        exit 1
    fi
    
    cd ../..
}

# Function to stop MongoDB
stop_mongodb() {
    print_status "Stopping MongoDB..."
    
    if [ ! -d "Server/mongo-init" ]; then
        print_warning "Server/mongo-init directory not found. Skipping MongoDB stop."
        return 0
    fi
    
    cd Server/mongo-init
    
    # Stop MongoDB containers
    docker-compose down
    
    print_success "MongoDB stopped successfully!"
    
    cd ../..
}

# Function to setup validation data
setup_validation_data() {
    print_status "Setting up validation data in database..."
    
    # Wait a bit more for MongoDB to be fully ready
    print_status "Waiting for MongoDB to be fully ready..."
    sleep 10
    
    # Navigate to Server directory
    cd "$SCRIPT_DIR/Server"
    
    # Check if node_modules exists, install if not
    if [ ! -d "node_modules" ]; then
        print_status "Installing npm dependencies..."
        npm install
    fi
    
    # Run validation setup script (includes meeting validation fix)
    if node setup-validation-schemas.js; then
        print_success "Validation data setup completed successfully!"
    else
        print_error "Failed to setup validation data. Check logs above."
        exit 1
    fi
    
    cd ../..
}

# Function to start Node.js server
start_server() {
    print_status "Starting Node.js server..."
    print_status "Port: 5001"
    print_status "API Base: /api"
    
    # Check if package.json exists
    if [ ! -f "$SCRIPT_DIR/Server/package.json" ]; then
        print_error "Server/package.json not found. Please ensure the Server directory exists."
        exit 1
    fi
    
    # Check if server is already running
    if pgrep -f "nodemon index.js" > /dev/null; then
        print_warning "Node.js server is already running."
        print_status "Server URLs:"
        echo "  - Server: http://localhost:5001"
        echo "  - API: http://localhost:5001/api"
        print_status "API Documentation URLs:"
        echo "  - API Documentation: http://localhost:5001/api/docs"
        print_status "Test Coverage Reports:"
        echo "  - Combined Test Summary: http://localhost:5001/tests/coverage/combined-test-summary.html"
        return 0
    fi
    
    # Navigate to Server directory
    cd "$SCRIPT_DIR/Server"
    
    # Check if node_modules exists, install if not
    if [ ! -d "node_modules" ]; then
        print_status "Installing npm dependencies..."
        npm install
    fi
    
    # Start the server in background
    print_status "Launching Node.js server with nodemon..."
    npm start &
    SERVER_PID=$!
    
    # Wait for server to start
    print_status "Waiting for server to start..."
    sleep 3
    
    # Test server connection
    if curl -s http://localhost:5001/ > /dev/null 2>&1; then
        print_success "Node.js server started successfully!"
        print_status "Server PID: $SERVER_PID"
        echo $SERVER_PID > .server.pid
        
        # Generate combined test summary if coverage files exist
        if [ -f "tests/coverage/lcov.info" ]; then
            print_status "Generating combined test summary..."
            npm run test:coverage:summary > /dev/null 2>&1
            print_success "Combined test summary generated!"
        fi
        
        print_status "Server URLs:"
        echo "  - Server: http://localhost:5001"
        echo "  - API: http://localhost:5001/api"
        print_status "API Documentation URLs:"
        echo "  - API Documentation: http://localhost:5001/api/docs"
        print_status "Test Coverage Reports:"
        echo "  - Combined Test Summary: http://localhost:5001/tests/coverage/combined-test-summary.html"
        return 0
    else
        print_error "Failed to start Node.js server. Check logs above."
        exit 1
    fi
}

# Function to stop Node.js server
stop_server() {
    print_status "Stopping Node.js server..."
    
    # Try to stop by PID file first
    if [ -f "$SCRIPT_DIR/Server/.server.pid" ]; then
        SERVER_PID=$(cat "$SCRIPT_DIR/Server/.server.pid")
        if kill -0 $SERVER_PID 2>/dev/null; then
            kill $SERVER_PID
            print_success "Node.js server stopped successfully!"
        else
            print_warning "Server PID file exists but process not found."
        fi
        rm -f "$SCRIPT_DIR/Server/.server.pid"
    fi
    
    # Also try to kill any nodemon processes
    if pgrep -f "nodemon index.js" > /dev/null; then
        pkill -f "nodemon index.js"
        print_success "Node.js server processes stopped!"
    fi
}

# Function to start everything
start_all() {
    print_status "Starting MongoDB and Node.js server..."
    echo ""
    
    check_docker
    check_node
    check_npm
    
    start_mongodb
    echo ""
    setup_validation_data
    echo ""
    start_server
    echo ""
    
    print_success "All services started successfully!"
    echo ""
    print_status "🌐 All Access Points:"
    echo "  📊 MongoDB Database: mongodb://admin:admin123@localhost:27017/Prolink"
    echo "  🖥️  MongoDB Web UI: http://localhost:8081 (admin/admin123)"
    echo "  🚀 Node.js Server: http://localhost:5001"
    echo "  🔌 API Endpoints: http://localhost:5001/api"
    echo ""
    print_status "📚 API Documentation:"
    echo "  📄 API Documentation: http://localhost:5001/api/docs"
    print_status "🧪 Test Coverage Reports:"
    echo "  📈 Combined Test Summary: http://localhost:5001/tests/coverage/combined-test-summary.html"
    echo ""
    print_status "To stop all services, run: ./server.sh down"
}

# Function to stop everything
stop_all() {
    print_status "Stopping all services..."
    
    stop_server
    stop_mongodb
    
    print_success "All services stopped successfully!"
}

# Function to show status
show_status() {
    print_status "Checking service status..."
    
    echo ""
    echo "MongoDB Status:"
    if [ -d "Server/mongo-init" ]; then
        cd Server/mongo-init
        docker-compose ps
        cd ../..
        echo ""
        echo "MongoDB URLs:"
        echo "  📊 Database: mongodb://admin:admin123@localhost:27017/Prolink"
        echo "  🖥️  Web UI: http://localhost:8081 (admin/admin123)"
    else
        echo "  Server/mongo-init directory not found"
    fi
    
    echo ""
    echo "Node.js Server Status:"
    if [ -f "$SCRIPT_DIR/Server/.server.pid" ]; then
        SERVER_PID=$(cat "$SCRIPT_DIR/Server/.server.pid")
        if kill -0 $SERVER_PID 2>/dev/null; then
            echo "  Server is running (PID: $SERVER_PID)"
            echo ""
            echo "Server URLs:"
            echo "  🚀 Server: http://localhost:5001"
            echo "  🔌 API: http://localhost:5001/api"
            echo ""
            echo "API Documentation:"
            echo "  📄 OpenAPI Spec (JSON): http://localhost:5001/api/docs/openapi"
            echo "  📄 OpenAPI Spec (YAML): http://localhost:5001/api/docs/openapi.yaml"
            echo "  🔍 Swagger UI: http://localhost:5001/api/docs/swagger"
            echo "  📋 Contract Info: http://localhost:5001/api/docs/contracts"
            echo ""
            echo "Test Coverage Reports:"
            echo "  📈 Combined Test Summary: http://localhost:5001/tests/coverage/combined-test-summary.html"
        else
            echo "  Server PID file exists but process not running"
        fi
    else
        echo "  Server not running"
    fi
    
    if pgrep -f "nodemon index.js" > /dev/null; then
        echo "  Nodemon process found"
    fi
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
        stop_all
        sleep 2
        start_all
        ;;
    "setup-validation")
        check_docker
        check_node
        check_npm
        start_mongodb
        echo ""
        setup_validation_data
        ;;
    "fix-meeting")
        check_docker
        check_node
        check_npm
        start_mongodb
        echo ""
        print_status "Setting up validation schemas (includes meeting validation fix)..."
        cd "$SCRIPT_DIR/Server"
        if node setup-validation-schemas.js; then
            print_success "Validation schemas setup completed successfully!"
        else
            print_error "Failed to setup validation schemas. Check logs above."
            exit 1
        fi
        cd ../..
        ;;
    *)
        echo "Usage: $0 {up|down|status|restart|setup-validation|fix-meeting}"
        echo ""
        echo "Commands:"
        echo "  up              - Start MongoDB and Node.js server"
        echo "  down            - Stop MongoDB and Node.js server"
        echo "  status          - Show status of all services"
        echo "  restart         - Restart all services"
        echo "  setup-validation - Start MongoDB and setup validation data only"
        echo "  fix-meeting     - Start MongoDB and setup all validation schemas (includes meeting fix)"
        echo ""
        echo "Examples:"
        echo "  ./server.sh up"
        echo "  ./server.sh down"
        echo "  ./server.sh status"
        echo "  ./server.sh setup-validation"
        echo "  ./server.sh fix-meeting"
        exit 1
        ;;
esac 