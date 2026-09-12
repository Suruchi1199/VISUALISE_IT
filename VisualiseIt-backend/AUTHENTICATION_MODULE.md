# Authentication Module Documentation

## Overview
This document provides a complete guide to the authentication module implemented in the Educate Backend application using Spring Boot, Spring Security, JWT, and MySQL.

---

## Table of Contents
1. [Architecture](#architecture)
2. [Dependencies](#dependencies)
3. [Directory Structure](#directory-structure)
4. [Components](#components)
5. [API Endpoints](#api-endpoints)
6. [Setup Instructions](#setup-instructions)
7. [Usage Examples](#usage-examples)
8. [Security Best Practices](#security-best-practices)

---

## Architecture

The authentication module follows a layered architecture:

```
┌─────────────────┐
│    Controller   │  (Handles HTTP requests/responses)
├─────────────────┤
│     Service     │  (Business logic)
├─────────────────┤
│   Repository    │  (Database access)
├─────────────────┤
│  Security       │  (JWT, Authentication, Authorization)
├─────────────────┤
│    Database     │  (MySQL)
└─────────────────┘
```

---

## Dependencies

The following dependencies are added to `pom.xml`:

### Core Dependencies
- **Spring Boot Starter Web**: For REST API development
- **Spring Boot Starter Data JPA**: For database operations
- **Spring Boot Starter Security**: For authentication and authorization
- **Spring Boot Starter Test**: For unit testing

### Database
- **MySQL Connector Java**: MySQL database driver

### JWT
- **jjwt-api**: JWT library (API)
- **jjwt-impl**: JWT implementation
- **jjwt-jackson**: JSON support for JWT

### Utilities
- **Lombok**: Reduces boilerplate code with annotations

---

## Directory Structure

```
src/main/java/com/example/educate_backend/
├── config/
│   ├── SecurityConfig.java         # Spring Security configuration
│   └── GlobalExceptionHandler.java  # Global exception handling
├── controller/
│   ├── AuthController.java         # Authentication endpoints
│   └── AutoController.java         # (Existing)
├── dto/
│   ├── RegisterRequest.java        # Registration request DTO
│   ├── RegisterResponse.java       # Registration response DTO
│   ├── LoginRequest.java           # Login request DTO
│   └── LoginResponse.java          # Login response DTO
├── model/
│   ├── User.java                   # User entity
│   └── Role.java                   # Role enum
├── repository/
│   └── UserRepository.java         # User data access
├── security/
│   ├── JwtUtil.java                # JWT generation and validation
│   ├── JwtAuthenticationFilter.java # JWT authentication filter
│   ├── JwtAuthenticationEntryPoint.java # Unauthorized access handler
│   └── CustomUserDetailsService.java    # Custom user details service
├── service/
│   └── AuthService.java            # Authentication business logic
└── exception/
    ├── AuthenticationException.java
    ├── UserNotFoundException.java
    ├── EmailAlreadyExistsException.java
    └── InvalidInputException.java
```

---

## Components

### 1. User Entity (model/User.java)

**Purpose**: Represents a user in the system.

**Fields**:
- `id` (Long): Primary key, auto-generated
- `name` (String): User's full name
- `email` (String): Unique email address
- `password` (String): BCrypt-encoded password
- `role` (Role): User role (STUDENT or ADMIN)

**Key Points**:
- Email is unique
- Password is always BCrypt encoded
- Role is stored as enum for type safety

### 2. Role Enum (model/Role.java)

**Values**:
- `STUDENT`: Regular user registered through the application
- `ADMIN`: Administrator account (created manually)

**Key Points**:
- During registration, users are always assigned STUDENT role
- ADMIN accounts are created manually by system administrator

### 3. DTOs (dto/)

#### RegisterRequest
```java
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
}
```

#### RegisterResponse
```java
{
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "STUDENT",
    "message": "User registered successfully"
}
```

#### LoginRequest
```java
{
    "email": "john@example.com",
    "password": "password123"
}
```

#### LoginResponse
```java
{
    "token": "eyJhbGciOiJIUzUxMiJ9...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "STUDENT"
}
```

### 4. UserRepository (repository/UserRepository.java)

**Methods**:
- `findByEmail(String email)`: Find user by email
- `existsByEmail(String email)`: Check if email exists
- Inherits CRUD operations from JpaRepository

### 5. AuthService (service/AuthService.java)

**Methods**:

#### register(RegisterRequest)
- Validates input (name, email, password)
- Checks for duplicate email
- Encodes password using BCrypt
- Saves user with STUDENT role
- Returns RegisterResponse

#### login(LoginRequest)
- Validates input
- Finds user by email
- Verifies password using BCrypt
- Generates JWT token
- Returns LoginResponse with token

**Validation**:
- Email: Required and must be valid format
- Password: Required, minimum 6 characters
- Name: Required

### 6. JWT Components (security/)

#### JwtUtil.java
- Generates JWT tokens with claims
- Extracts information from tokens
- Validates token expiration and signature
- Key method:
  - `generateToken(String email, String role)`: Creates JWT
  - `extractEmail(String token)`: Gets email from token
  - `extractRole(String token)`: Gets role from token
  - `validateToken(String token)`: Validates token

#### JwtAuthenticationFilter.java
- Intercepts HTTP requests
- Extracts JWT from Authorization header (Bearer token)
- Validates token and sets authentication context
- Runs before UsernamePasswordAuthenticationFilter

#### JwtAuthenticationEntryPoint.java
- Handles unauthorized access attempts
- Returns 401 status with error message

#### CustomUserDetailsService.java
- Implements UserDetailsService
- Loads user details from database
- Returns CustomUserDetails with authorities
- Role is converted to GrantedAuthority with ROLE_ prefix

### 7. SecurityConfig (config/SecurityConfig.java)

**Configuration**:

1. **Password Encoder**: BCryptPasswordEncoder
   - 10 rounds of hashing (default)
   - One-way encryption

2. **Authentication Provider**: DaoAuthenticationProvider
   - Uses CustomUserDetailsService
   - Uses BCryptPasswordEncoder

3. **HTTP Security**:
   - **Public endpoints** (permitted without authentication):
     - `/api/auth/**` (registration and login)
     - `/actuator/health`
     - `/swagger-ui/**`, `/v3/api-docs/**`
   - **Protected endpoints**: All other endpoints require authentication
   - **CSRF**: Disabled for stateless API
   - **Session**: STATELESS (no session cookies)
   - **CORS**: Allowed from all origins

4. **JWT Filter**: Added before UsernamePasswordAuthenticationFilter

### 8. AuthController (controller/AuthController.java)

**Endpoints**:

#### POST /api/auth/register
- Register new user
- Request: RegisterRequest
- Response: RegisterResponse (201 CREATED)
- Errors: 400 (Invalid Input), 409 (Email Exists)

#### POST /api/auth/login
- Authenticate user and get JWT token
- Request: LoginRequest
- Response: LoginResponse (200 OK)
- Errors: 400 (Invalid Input), 401 (Unauthorized)

#### GET /api/auth/health
- Health check endpoint
- Response: "Auth service is up and running" (200 OK)

### 9. Exception Handling (exception/ and config/GlobalExceptionHandler.java)

**Custom Exceptions**:
1. `InvalidInputException`: Validation errors
2. `EmailAlreadyExistsException`: Duplicate email
3. `UserNotFoundException`: User not found in database
4. `AuthenticationException`: Authentication failures

**Error Response Format**:
```java
{
    "timestamp": "2024-01-15T10:30:45",
    "status": 400,
    "error": "Invalid Input",
    "message": "Password must be at least 6 characters long",
    "path": "/api/auth/register"
}
```

---

## API Endpoints

### 1. Registration

**Endpoint**: `POST /api/auth/register`

**Request**:
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rahul Kumar",
    "email": "rahul@gmail.com",
    "password": "password123"
  }'
```

**Success Response** (201 Created):
```json
{
    "id": 1,
    "name": "Rahul Kumar",
    "email": "rahul@gmail.com",
    "role": "STUDENT",
    "message": "User registered successfully"
}
```

**Error Response** (409 Conflict - Email Exists):
```json
{
    "timestamp": "2024-01-15T10:30:45",
    "status": 409,
    "error": "Conflict",
    "message": "Email already registered: rahul@gmail.com",
    "path": "/api/auth/register"
}
```

### 2. Login

**Endpoint**: `POST /api/auth/login`

**Request**:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rahul@gmail.com",
    "password": "password123"
  }'
```

**Success Response** (200 OK):
```json
{
    "token": "eyJhbGciOiJIUzUxMiJ9.eyJyb2xlIjoiU1RVEROVEEJ.X-1q8X...",
    "name": "Rahul Kumar",
    "email": "rahul@gmail.com",
    "role": "STUDENT"
}
```

**Using JWT in Subsequent Requests**:
```bash
curl -X GET http://localhost:8080/api/protected-endpoint \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJyb2xlIjoiU1RVEROVEEJ.X-1q8X..."
```

### 3. Health Check

**Endpoint**: `GET /api/auth/health`

**Response** (200 OK):
```
Auth service is up and running
```

---

## Setup Instructions

### 1. Database Setup

```sql
-- Create database
CREATE DATABASE educate_db;

-- Use database
USE educate_db;

-- Tables will be created automatically by Hibernate DDL
```

### 2. Update application.properties

```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/educate_db
spring.datasource.username=root
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update

# JWT Configuration
app.jwt.secret=YourSecretKeyAtLeast32CharactersLong123456
app.jwt.expiration=86400000  # 24 hours in milliseconds
```

### 3. Build and Run

```bash
# Build project
mvn clean install

# Run application
mvn spring-boot:run

# Or using Java
java -jar target/educate-backend-0.0.1-SNAPSHOT.jar
```

### 4. Verify Setup

```bash
# Check if server is running
curl http://localhost:8080/api/auth/health

# Try registration
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"test123"}'
```

---

## Usage Examples

### Example 1: User Registration and Login

**Step 1: Register User**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Smith",
    "email": "alice@example.com",
    "password": "securePass123"
  }'
```

Response:
```json
{
    "id": 1,
    "name": "Alice Smith",
    "email": "alice@example.com",
    "role": "STUDENT",
    "message": "User registered successfully"
}
```

**Step 2: Login User**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "securePass123"
  }'
```

Response:
```json
{
    "token": "eyJhbGciOiJIUzUxMiJ9.eyJyb2xlIjoiU1RVEROVEEJ...",
    "name": "Alice Smith",
    "email": "alice@example.com",
    "role": "STUDENT"
}
```

**Step 3: Access Protected Resource**
```bash
curl -X GET http://localhost:8080/api/protected-endpoint \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJyb2xlIjoiU1RVEROVEEJ..."
```

### Example 2: Error Handling

**Invalid Registration (Missing Name)**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Response (400 Bad Request):
```json
{
    "timestamp": "2024-01-15T10:45:30",
    "status": 400,
    "error": "Invalid Input",
    "message": "Name is required",
    "path": "/api/auth/register"
}
```

**Duplicate Email Registration**
```bash
# First registration succeeds
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "User One",
    "email": "duplicate@example.com",
    "password": "password123"
  }'

# Second registration with same email fails
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "User Two",
    "email": "duplicate@example.com",
    "password": "password123"
  }'
```

Response (409 Conflict):
```json
{
    "timestamp": "2024-01-15T10:50:15",
    "status": 409,
    "error": "Conflict",
    "message": "Email already registered: duplicate@example.com",
    "path": "/api/auth/register"
}
```

---

## Security Best Practices

### 1. Password Security

✅ **Implemented**:
- BCrypt hashing with 10 rounds
- Password validation (minimum 6 characters)
- Passwords never stored in plain text
- Password verification using PasswordEncoder.matches()

**Recommendations**:
- Increase minimum password length to 8+ characters
- Implement password strength requirements (uppercase, numbers, special chars)
- Add rate limiting on failed login attempts
- Implement account lockout after N failed attempts

### 2. JWT Security

✅ **Implemented**:
- HS512 algorithm (symmetric, suitable for internal services)
- Token expiration (configurable, default 24 hours)
- Secure secret key (32+ characters)
- Bearer token in Authorization header
- Token validation on every protected request

**Recommendations**:
- Use RS256 algorithm for public-facing APIs (asymmetric cryptography)
- Implement token refresh endpoint
- Add jti (JWT ID) claim to prevent token reuse
- Reduce token expiration time (especially for sensitive operations)
- Implement token blacklist/revocation on logout

### 3. HTTPS/TLS

**Recommendations**:
- Always use HTTPS in production
- Configure SSL/TLS certificates
- Enforce HTTPS redirects

### 4. CORS Configuration

**Current**: Allows from all origins (`*`)

**Recommendations**:
```java
@CrossOrigin(origins = "https://yourdomain.com")
```

### 5. Rate Limiting

**Recommendations**:
- Implement rate limiting on auth endpoints
- Use Spring Cloud Gateway or similar
- Example: Max 5 login attempts per minute per IP

### 6. Logging and Monitoring

✅ **Implemented**:
- Detailed logging of authentication events
- Error logging without sensitive data
- DEBUG level for auth module

**Recommendations**:
- Monitor failed login attempts
- Alert on suspicious activities
- Regular security audits

### 7. Database Security

**Recommendations**:
- Use strong database passwords
- Enable SSL for database connections
- Encrypt sensitive data at rest
- Regular database backups
- Implement proper database user permissions

### 8. Dependency Updates

**Recommendations**:
- Regularly update Spring Boot and dependencies
- Monitor security advisories
- Keep JWT library updated

---

## Creating Admin Users

Admin users cannot be created through the public registration API. They must be created manually using one of these methods:

### Method 1: Database Insert
```sql
-- Hash password using bcrypt (e.g., "admin123" hashed)
INSERT INTO users (name, email, password, role) 
VALUES ('Admin User', 'admin@example.com', '$2a$10$...', 'ADMIN');
```

### Method 2: Create Admin API (to be implemented)
Create a separate protected endpoint (requires existing admin credentials) to create new admins.

---

## Testing the API

### Using Postman

1. **Register**:
   - Method: POST
   - URL: http://localhost:8080/api/auth/register
   - Body (JSON): 
     ```json
     {
       "name": "Test User",
       "email": "test@example.com",
       "password": "password123"
     }
     ```

2. **Login**:
   - Method: POST
   - URL: http://localhost:8080/api/auth/login
   - Body (JSON):
     ```json
     {
       "email": "test@example.com",
       "password": "password123"
     }
     ```
   - Copy the token from response

3. **Access Protected Endpoint**:
   - Method: GET
   - URL: http://localhost:8080/api/protected-endpoint
   - Headers:
     - Authorization: Bearer {token}

---

## Troubleshooting

### Issue: "User not found" on login
**Cause**: Email doesn't exist in database
**Solution**: Register user first

### Issue: "Email already registered"
**Cause**: Attempting to register with existing email
**Solution**: Use different email or login with existing account

### Issue: Invalid token
**Cause**: Token expired or tampered with
**Solution**: Login again to get new token

### Issue: Port 8080 already in use
**Solution**: Change port in application.properties
```properties
server.port=8081
```

---

## Future Enhancements

1. **Refresh Token**: Implement token refresh mechanism
2. **Two-Factor Authentication**: Add 2FA support
3. **OAuth2 Integration**: Support OAuth2 providers (Google, GitHub, etc.)
4. **Password Reset**: Implement forgot password functionality
5. **Email Verification**: Add email verification on registration
6. **Role-Based Access Control (RBAC)**: Implement fine-grained permissions
7. **Audit Logging**: Track user activities
8. **Rate Limiting**: Prevent brute force attacks
9. **Account Lockout**: Temporary lockout after failed attempts
10. **Remember Me**: Persistent login option

---

## Contact & Support

For issues or questions, please refer to the main project documentation or contact the development team.

