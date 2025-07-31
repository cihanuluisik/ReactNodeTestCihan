# ⚙️ React & Node.js Skill Test


# SOLUTION


#### What I have built

- First brought containerized Mongo db, arranged all env files to connecto to db both stand alone run and test runs.

- JWT login system with bcrypt password hashing.

- Full CRUD operations with MongoDB and role-based access and database-driven validation with Joi schemas and caching inspired by existing validation controller and code.

- Split business logic into focused services (Auth, Meeting, Validation, User).

- Repository pattern for clean database access.

- Cucumber tests that actually hit the database.

- Tests for auth flows, meetings, and data integrity.

- Auto-generated docs with apidoc and JSDoc.

- SuperAdmin and User roles with proper access control.

- SOLID principles, short methods (under 30 lines).

- No hardcoded secrets, proper config management.

- Complete testing setup with Cucumber [Cucumber](Server/tests/features) and [integration tests](Server/tests/integration).  Created [combined-test-summary.html](Server/tests/coverage/combined-test-summary.html)

#### How I Built It

I took a practical approach - built core features using  API-first design with contract-driven development.

#### Testing Strategy

Went with honeycomb/diamond model instead of traditional pyramid. Focused on real E2E tests and integration tests rather than tons of unit tests.

#### Key Numbers

- 85%+ E2E test coverage with real database
- All methods under 30 lines
- Database validation with 5-minute caching
- Complete CRUD with proper error handling
- Role-based security throughout

#### Architecture

Layered setup with controllers, services, repositories, and validation. Testing focuses on real end-to-end scenarios. 





## 📌 Task Overview

This test is designed to evaluate your coding ability through the experience of building the project from scratch and a basic RESTful feature using **React** and **Node.js**, with attention to code quality and best practices.

---

## ✅ Requirements

### 1. Successful authentication
Set up the project independently and Ensure successful authentication.\
Implement and verify the **sign-in feature** using the credentials provided below:
  - **Email**: `admin@gmail.com`  
  - **Password**: `admin123`

### 2. "Meeting" Feature (CRUD via RESTful API)
After successful sign-in, implement the **Meeting** functionality on both the **server** and **client** sides.\
Use a standard **RESTful API** approach.\
Focus on:
  - Code structure and maintainability
  - Clean and consistent code style
  - Optimization where applicable
You may reference the structure or logic of other existing features within the project.





