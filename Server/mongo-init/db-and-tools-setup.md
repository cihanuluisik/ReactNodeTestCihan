# MongoDB Container Setup

## Overview
This setup provides MongoDB with a web-based management interface using Docker containers.

## Services Running

### 1. MongoDB Database
- **Container**: `mongodb`
- **Image**: `mongo:8.0`
- **Port**: `27017`
- **Database**: `Prolink`
- **Root Username**: `admin`
- **Root Password**: `admin123`

### 2. MongoDB Express (Web UI)
- **Container**: `mongo-express`
- **Image**: `mongo-express:1.0.0`
- **Port**: `8081`
- **URL**: http://localhost:8081
- **Username**: `admin`
- **Password**: `admin123`

## Connection Details

### For Your Node.js Server
```javascript
// Connection URL (already configured in index.js)
const DATABASE_URL = 'mongodb://admin:admin123@127.0.0.1:27017'
const DATABASE = 'Prolink'
```

### For MongoDB Compass or other clients
```
Connection String: mongodb://admin:admin123@localhost:27017
Database: Prolink
```

## Access Points

### 1. Web UI (MongoDB Express)
- **URL**: http://localhost:8081
- **Login**: 
  - Username: `admin`
  - Password: `admin123`
- **Features**:
  - Browse databases and collections
  - View and edit documents
  - Execute queries
  - Import/export data
  - Monitor database performance

### 2. Direct Database Access
- **Host**: `localhost`
- **Port**: `27017`
- **Database**: `Prolink`
- **Authentication**: Required

## Management Commands

### Start the containers
```bash
cd Server/mongo-init
docker-compose up -d
```

### Stop the containers
```bash
cd Server/mongo-init
docker-compose down
```

### View logs
```bash
cd Server/mongo-init
docker-compose logs mongodb
docker-compose logs mongo-express
```

### Access MongoDB shell
```bash
docker exec -it mongodb mongosh -u admin -p admin123
```

### Check container status
```bash
cd Server/mongo-init
docker-compose ps
```

## Database Structure

The following collections are automatically created:
- `User` - User management
- `Contact` - Contact information
- `Lead` - Lead management
- `Property` - Property listings
- `Account` - Account management
- `Invoice` - Invoice management
- `Quote` - Quote management
- `Task` - Task management
- `Meeting` - Meeting scheduling
- `Email` - Email management
- `Document` - Document storage
- `CustomField` - Dynamic field management
- `RoleAccess` - Role-based access control

## Security Notes

- The containers are configured for development use
- For production, consider:
  - Using environment variables for passwords
  - Restricting network access
  - Using SSL/TLS connections
  - Implementing proper backup strategies

## Troubleshooting

### If containers won't start
```bash
# Check if ports are already in use
lsof -i :27017
lsof -i :8081

# Remove existing containers and volumes
cd Server/mongo-init
docker-compose down -v
docker-compose up -d
```

### If connection fails
1. Check if containers are running: `docker-compose ps`
2. Check container logs: `docker-compose logs mongodb`
3. Verify credentials are correct
4. Ensure no firewall is blocking the ports 