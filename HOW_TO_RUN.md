# How to Run - React & Node.js Application

## How to Run the App and UI Locally

### Option 1: Using the Start Script (Recommended)
```bash
# Start both backend and frontend with one command
./start-all.sh up

./start-all.sh down
```

### Access Points
- **React App**: http://localhost:3000 (or next available port)
- **Node.js Server**: http://localhost:5001
- **API Endpoints**: http://localhost:5001/api
- **MongoDB Database**: mongodb://admin:admin123@localhost:27017/Prolink
- **MongoDB Web UI**: http://localhost:8081 (admin/admin123)

### Default Login Credentials
- **Email**: `admin@gmail.com`
- **Password**: `admin123`

---

## How to Run Client Tests

```bash
# Navigate to client directory
cd Client

npm run test:coverage

```

---

## How to Run Tests with Coverage

### Backend Coverage
```bash
# Navigate to server directory
cd Server

# Run complete coverage (Jest + Cucumber + Merged Report)
npm run test:coverage:complete
```

---

## HTML Coverage Report Files

### Backend Combined Coverage Report
- **Primary Report**: [combined-test-summary.html](Server/tests/coverage/combined-test-summary.html)
- **Comprehensive Report**: [merged-coverage.html](Server/tests/coverage/merged-coverage.html)
- **JSON Report**: [combined-test-report.json](Server/tests/coverage/combined-test-report.json)

### Individual Coverage Reports
- **Jest Coverage**: [jest/index.html](Server/tests/coverage/jest/index.html)
- **Cucumber Coverage**: [cucumber/lcov-report/index.html](Server/tests/coverage/cucumber/lcov-report/index.html)

---

## Feature Files Location

### Login/Authentication Features
- **Sign In**: [signin.feature](Server/tests/features/signin.feature)
- **Sign Up**: [signup.feature](Server/tests/features/signup.feature)
- **Negative Sign In**: [signin.negative.feature](Server/tests/features/signin.negative.feature)
- **Negative Sign Up**: [signup.negative.feature](Server/tests/features/signup.negative.feature)

### Meeting Features
- **Meeting CRUD**: [meeting.feature](Server/tests/features/meeting.feature)
- **Meeting Negative Tests**: [meeting.negative.feature](Server/tests/features/meeting.negative.feature)
- **Meeting E2E**: [meeting.e2e.feature](Server/tests/features/meeting.e2e.feature)

### Step Definitions
- **Location**: [step-definitions/](Server/tests/features/step-definitions/)
- **Files**: [meeting.steps.js](Server/tests/features/step-definitions/meeting.steps.js), [signin.steps.js](Server/tests/features/step-definitions/signin.steps.js), [shared.steps.js](Server/tests/features/step-definitions/shared.steps.js)

---

## Backend Coverage Figures

### Total Coverage for Login and Meeting Features
- **Overall Coverage**: 85% 

---

### Documentation
```bash
# Generate API documentation
npm run docs

### Database Setup
```bash
# MongoDB setup (if using Docker)
cd Server/mongo-init
docker-compose up -d
``` 