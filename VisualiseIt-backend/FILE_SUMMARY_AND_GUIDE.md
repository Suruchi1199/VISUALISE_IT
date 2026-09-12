# Authentication Module - File Summary and Implementation Guide

## Overview
This document summarizes all files created for the complete authentication module and provides guidance on how they work together.

---

## Files Created

### 1. Model Layer
Located in: `src/main/java/com/example/educate_backend/model/`

#### User.java
- **Type**: JPA Entity
- **Database Table**: `users`
- **Fields**:
  - `id` (Long): Primary key, auto-generated
  - `name` (String): User's full name
  - `email` (String): Unique email address
  - `password` (String): BCrypt-encoded password
  - `role` (Role): User role (STUDENT or ADMIN)
- **Annotations**: @Entity, @Table, @Data, @NoArgsConstructor, @AllArgsConstructor
- **Purpose**: Represents a user in the database
- **Key Features**:
  - Email is unique (prevents duplicate registrations)
  - Password is always BCrypt encoded (never stored in plain text)
  - Uses enum for type-safe role assignment

#### Role.java
- **Type**: Enum
- **Values**:
  - `STUDENT`: Regular user registered through the application
  - `ADMIN`: Administrator account (created manually)
- **Purpose**: Type-safe role representation
- **Key Features**:
  - Prevents invalid role values
  - Easy to extend with new roles in the future

---

### 2. DTO Layer
Located in: `src/main/java/com/example/educate_backend/dto/`

#### RegisterRequest.java
- **Purpose**: Transfer object for registration request from client
- **Fields**: name, email, password
- **Usage**: Received from `/api/auth/register` endpoint
- **Key Features**:
  - Uses Lombok annotations (@Data) to reduce boilerplate
  - No role field (role is always set to STUDENT server-side)
  - Input validation happens in AuthService

#### RegisterResponse.java
- **Purpose**: Transfer object for registration response to client
- **Fields**: id, name, email, role, message
- **Usage**: Sent as response from `/api/auth/register` endpoint
- **Key Features**:
  - Includes success message
  - Returns user details for confirmation
  - Includes generated user ID

#### LoginRequest.java
- **Purpose**: Transfer object for login request from client
- **Fields**: email, password
- **Usage**: Received from `/api/auth/login` endpoint
- **Key Features**:
  - Minimal fields (only credentials required)
  - Input validation happens in AuthService

#### LoginResponse.java
- **Purpose**: Transfer object for login response to client
- **Fields**: token, name, email, role
- **Usage**: Sent as response from `/api/auth/login` endpoint
- **Key Features**:
  - Contains JWT token for subsequent requests
  - Includes user details for display
  - Token format: Bearer token (add to Authorization header)

---

### 3. Repository Layer
Located in: `src/main/java/com/example/educate_backend/Repository/`

#### UserRepository.java
- **Purpose**: Data access object for User entity
- **Interface**: Extends JpaRepository<User, Long>
- **Custom Methods**:
  - `Optional<User> findByEmail(String email)`: Find user by email
  - `boolean existsByEmail(String email)`: Check if email exists
- **Inherited Methods** (from JpaRepository):
  - `save(User user)`: Insert or update user
  - `findById(Long id)`: Find user by ID
  - `findAll()`: Get all users
  - `delete(User user)`: Delete user
- **Purpose**: Encapsulates database operations for users
- **Key Features**:
  - Spring Data JPA automatically implements methods
  - Custom method names follow Spring Data naming convention

---

### 4. Exception Layer
Located in: `src/main/java/com/example/educate_backend/exception/`

#### InvalidInputException.java
- **Extends**: RuntimeException
- **Usage**: Thrown when input validation fails
- **HTTP Status**: 400 Bad Request
- **Examples**:
  - Empty email
  - Password less than 6 characters
  - Invalid email format

#### EmailAlreadyExistsException.java
- **Extends**: RuntimeException
- **Usage**: Thrown when registering with duplicate email
- **HTTP Status**: 409 Conflict
- **Purpose**: Prevents duplicate email registrations

#### UserNotFoundException.java
- **Extends**: RuntimeException
- **Usage**: Thrown when user not found in database
- **HTTP Status**: 404 Not Found
- **Examples**:
  - Login with non-existent email
  - Load user details for non-existent user

#### AuthenticationException.java
- **Extends**: RuntimeException
- **Usage**: Thrown when authentication fails
- **HTTP Status**: 401 Unauthorized
- **Examples**:
  - Wrong password
  - Invalid JWT token

**Key Feature**: All custom exceptions are caught by GlobalExceptionHandler and converted to appropriate HTTP responses.

---

### 5. Security Layer
Located in: `src/main/java/com/example/educate_backend/security/`

#### JwtUtil.java
**Purpose**: JWT token generation and validation

**Key Methods**:
- `generateToken(String email, String role)`: Create JWT token with claims
- `extractEmail(String token)`: Extract email from token
- `extractRole(String token)`: Extract role from token
- `validateToken(String token)`: Validate token signature and expiration
- `isTokenExpired(String token)`: Check if token is expired

**Token Structure**:
```
Header.Payload.Signature

Example: eyJhbGciOiJIUzUxMiJ9.eyJyb2xlIjoiU1RVREVOUJ...
                Header          Payload                Signature
```

**Algorithm**: HS512 (HMAC SHA-512)

**Configuration**:
- Secret: Configured in `application.properties` (`app.jwt.secret`)
- Expiration: Configurable in `application.properties` (`app.jwt.expiration`)
- Claims: email (subject) and role

**Key Features**:
- Secure token generation
- Expiration validation
- Signature verification

---

#### JwtAuthenticationFilter.java
**Purpose**: Intercepts HTTP requests and validates JWT tokens

**Execution Flow**:
1. Intercepts every HTTP request
2. Looks for "Authorization" header with "Bearer " prefix
3. Extracts JWT token from header
4. Validates token using JwtUtil
5. Loads user details from database
6. Sets authentication in SecurityContext
7. Continues request processing

**Key Methods**:
- `doFilterInternal()`: Main filter logic
- `extractJwtFromRequest()`: Extract token from header

**Extends**: OncePerRequestFilter (ensures filter runs once per request)

**Key Features**:
- Error handling (catches and logs exceptions)
- Non-blocking (continues even if token validation fails)
- Works with stateless session management

---

#### JwtAuthenticationEntryPoint.java
**Purpose**: Handles unauthorized access attempts

**Invoked When**:
- User accesses protected endpoint without token
- Token is invalid or expired
- User lacks required permissions

**Response**:
- HTTP Status: 401 Unauthorized
- Content Type: application/json
- Response: `{"status": 401, "message": "Unauthorized - Invalid or missing token"}`

**Key Features**:
- Implements AuthenticationEntryPoint
- Converts exceptions to JSON responses
- Provides user-friendly error messages

---

#### CustomUserDetailsService.java
**Purpose**: Loads user details from database for authentication

**Components**:

1. **CustomUserDetailsService Class**:
   - Implements UserDetailsService
   - Overrides `loadUserByUsername(String email)`
   - Loads User from database
   - Wraps in CustomUserDetails object

2. **CustomUserDetails Inner Class**:
   - Implements UserDetails interface
   - Stores User entity
   - Provides authorities based on role
   - Returns user details to Spring Security

**Authority Mapping**:
- Database Role → Spring Security Authority
- `STUDENT` → `ROLE_STUDENT`
- `ADMIN` → `ROLE_ADMIN`

**Key Methods**:
- `getAuthorities()`: Returns user's roles as GrantedAuthority
- `getPassword()`: Returns BCrypt-encoded password
- `getUsername()`: Returns email (used as username)
- `getUser()`: Returns original User entity

**Key Features**:
- Bridge between database and Spring Security
- Supports role-based authorization
- Custom authorities management

---

### 6. Service Layer
Located in: `src/main/java/com/example/educate_backend/service/`

#### AuthService.java
**Purpose**: Core business logic for authentication

**Key Methods**:

1. **`register(RegisterRequest registerRequest)`**
   - **Steps**:
     1. Validate input (name, email, password)
     2. Check if email already exists
     3. Create User entity
     4. Encode password using BCryptPasswordEncoder
     5. Set role to STUDENT (always)
     6. Save to database
     7. Return RegisterResponse
   
   - **Exceptions**:
     - InvalidInputException: If input is invalid
     - EmailAlreadyExistsException: If email exists
   
   - **Response**: RegisterResponse with user ID, email, role

2. **`login(LoginRequest loginRequest)`**
   - **Steps**:
     1. Validate input
     2. Find user by email
     3. Verify password using PasswordEncoder
     4. Generate JWT token
     5. Return LoginResponse with token
   
   - **Exceptions**:
     - InvalidInputException: If input is invalid
     - UserNotFoundException: If user not found
     - AuthenticationException: If password is wrong
   
   - **Response**: LoginResponse with JWT token

3. **`validateRegisterRequest(RegisterRequest)`**
   - Validates name, email, password
   - Checks email format
   - Checks password length (minimum 6)

4. **`validateLoginRequest(LoginRequest)`**
   - Validates email and password
   - Checks email format

5. **`isValidEmail(String email)`**
   - Simple regex-based email validation

**Key Features**:
- Comprehensive input validation
- BCrypt password encoding
- JWT token generation
- Role assignment automation
- Detailed logging

---

### 7. Controller Layer
Located in: `src/main/java/com/example/educate_backend/controller/`

#### AuthController.java
**Purpose**: Handles HTTP requests for authentication

**Base URL**: `/api/auth`

**Endpoints**:

1. **`POST /api/auth/register`**
   - **Request**: RegisterRequest (name, email, password)
   - **Response**: RegisterResponse (HTTP 201 Created)
   - **Error Responses**:
     - 400 Bad Request: Invalid input
     - 409 Conflict: Email already exists
   - **Example**:
     ```bash
     curl -X POST http://localhost:8080/api/auth/register \
       -H "Content-Type: application/json" \
       -d '{"name":"John","email":"john@example.com","password":"pass123"}'
     ```

2. **`POST /api/auth/login`**
   - **Request**: LoginRequest (email, password)
   - **Response**: LoginResponse with JWT token (HTTP 200 OK)
   - **Error Responses**:
     - 400 Bad Request: Invalid input
     - 401 Unauthorized: Wrong credentials
   - **Example**:
     ```bash
     curl -X POST http://localhost:8080/api/auth/login \
       -H "Content-Type: application/json" \
       -d '{"email":"john@example.com","password":"pass123"}'
     ```

3. **`GET /api/auth/health`**
   - **Response**: "Auth service is up and running" (HTTP 200 OK)
   - **Purpose**: Health check endpoint

**Key Features**:
- Comprehensive error handling
- Proper HTTP status codes
- JSON request/response
- CORS enabled (@CrossOrigin)
- Detailed logging

---

### 8. Configuration Layer
Located in: `src/main/java/com/example/educate_backend/config/`

#### SecurityConfig.java
**Purpose**: Spring Security configuration

**Key Beans Created**:

1. **PasswordEncoder Bean**
   - Type: BCryptPasswordEncoder
   - Purpose: Password hashing and verification
   - Strength: 10 rounds of hashing

2. **DaoAuthenticationProvider Bean**
   - Uses CustomUserDetailsService
   - Uses BCryptPasswordEncoder
   - Handles user authentication

3. **AuthenticationManager Bean**
   - Manages authentication providers
   - Used for authentication

4. **JwtAuthenticationFilter Bean**
   - JWT filter instance

**Security Filter Chain Configuration**:

1. **CSRF Disabled**: `.csrf(csrf -> csrf.disable())`
   - Appropriate for stateless REST APIs

2. **Exception Handling**: 
   - Sets JwtAuthenticationEntryPoint
   - Handles 401 Unauthorized

3. **Session Management**: 
   - `SessionCreationPolicy.STATELESS`
   - No session cookies (JWT-based)

4. **Authorization Rules**:
   ```
   Public:
   - /api/auth/**
   - /actuator/health
   - /swagger-ui/**, /v3/api-docs/**
   
   Protected:
   - All other endpoints (require authentication)
   ```

5. **Filter Order**:
   - JwtAuthenticationFilter added before UsernamePasswordAuthenticationFilter
   - Processes JWT tokens first

**Key Features**:
- BCrypt password encoding
- JWT-based authentication
- Stateless session management
- Role-based authorization
- Centralized security configuration

---

#### GlobalExceptionHandler.java
**Purpose**: Centralized exception handling

**Handled Exceptions**:
1. InvalidInputException → 400 Bad Request
2. EmailAlreadyExistsException → 409 Conflict
3. UserNotFoundException → 404 Not Found
4. AuthenticationException → 401 Unauthorized
5. Generic Exception → 500 Internal Server Error

**Response Format**:
```json
{
    "timestamp": "2024-01-15T10:30:45",
    "status": 400,
    "error": "Invalid Input",
    "message": "Email is required",
    "path": "/api/auth/register"
}
```

**Key Features**:
- Standardized error responses
- Consistent error format
- Detailed error information
- Logging of errors

---

### 9. Example Controller
Located in: `src/main/java/com/example/educate_backend/example/`

#### ProtectedControllerExample.java
**Purpose**: Reference implementation for protected endpoints

**Example Endpoints**:
- `/api/protected/user-profile`: Requires authentication
- `/api/protected/admin-panel`: Requires ADMIN role
- `/api/protected/student-dashboard`: Requires STUDENT role
- `/api/protected/courses`: Requires authentication

**Authorization Examples**:
- `@PreAuthorize("hasRole('ADMIN')")`
- `@PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")`
- `@PreAuthorize("isAuthenticated()")`

**Key Features**:
- Shows how to protect endpoints
- Role-based access control examples
- Principal injection example
- SecurityContextHolder usage example

---

### 10. Documentation Files

#### AUTHENTICATION_MODULE.md
- **Purpose**: Comprehensive documentation
- **Contents**:
  - Architecture overview
  - Component descriptions
  - API documentation
  - Setup instructions
  - Usage examples
  - Security best practices
  - Troubleshooting guide

#### QUICK_START.md
- **Purpose**: Quick setup guide
- **Contents**:
  - 5-minute setup
  - Common configuration
  - Testing checklist
  - Troubleshooting

#### FILE_SUMMARY_AND_GUIDE.md (this file)
- **Purpose**: Reference for all created files
- **Contents**:
  - File descriptions
  - Component relationships
  - Integration flow
  - Key decisions

---

### 11. Configuration File

#### application.properties
**Updates Made**:
- Added JWT configuration:
  - `app.jwt.secret`: Secret key for JWT signing
  - `app.jwt.expiration`: Token expiration time (24 hours)
- Added logging configuration
- Database configuration (existing)

---

## Component Relationships

```
┌─────────────────────────────────────────────────────────┐
│                   HTTP Request                           │
└──────────────────────┬──────────────────────────────────┘
                       ↓
         ┌─────────────────────────────────┐
         │ JwtAuthenticationFilter         │
         │ (Intercepts all requests)       │
         └────────┬────────────────────────┘
                  ↓
         ┌─────────────────────────────────┐
         │ Validates JWT Token             │
         │ (Calls JwtUtil.validateToken)   │
         └────────┬────────────────────────┘
                  ↓
         ┌─────────────────────────────────┐
         │ Loads User from DB              │
         │ (CustomUserDetailsService)      │
         └────────┬────────────────────────┘
                  ↓
         ┌─────────────────────────────────┐
         │ Sets Authentication             │
         │ (In SecurityContext)            │
         └────────┬────────────────────────┘
                  ↓
      ┌──────────────────────────────────────┐
      │ Route to Controller                  │
      │ (AuthController or other)            │
      └────┬─────────────────────────────────┘
           ↓
┌──────────────────────────────────────────┐
│ POST /api/auth/register                  │
│ ├─ AuthService.register()                │
│ │  ├─ Validate input                     │
│ │  ├─ Check email exists (Repository)    │
│ │  ├─ Encode password (PasswordEncoder)  │
│ │  ├─ Save User (Repository)             │
│ │  └─ Return RegisterResponse            │
│ └─ Return HTTP 201                       │
│                                          │
│ POST /api/auth/login                     │
│ ├─ AuthService.login()                   │
│ │  ├─ Validate input                     │
│ │  ├─ Find user by email (Repository)    │
│ │  ├─ Verify password (PasswordEncoder)  │
│ │  ├─ Generate JWT (JwtUtil)             │
│ │  └─ Return LoginResponse with token    │
│ └─ Return HTTP 200                       │
└──────────────────────────────────────────┘
           ↓
   ┌───────────────────────┐
   │  HTTP Response        │
   │  (JSON)               │
   └───────────────────────┘
```

---

## Data Flow for Registration

```
Client
  ↓
POST /api/auth/register
{
  "name": "John",
  "email": "john@example.com",
  "password": "password123"
}
  ↓
AuthController.register()
  ↓
AuthService.register()
  ├─ validateRegisterRequest()
  ├─ userRepository.existsByEmail()
  ├─ passwordEncoder.encode()
  ├─ userRepository.save()
  └─ Return RegisterResponse
  ↓
HTTP 201 Created
{
  "id": 1,
  "name": "John",
  "email": "john@example.com",
  "role": "STUDENT",
  "message": "User registered successfully"
}
```

---

## Data Flow for Login & Authentication

```
Client
  ↓
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
  ↓
AuthController.login()
  ↓
AuthService.login()
  ├─ validateLoginRequest()
  ├─ userRepository.findByEmail()
  ├─ passwordEncoder.matches()
  ├─ jwtUtil.generateToken()
  └─ Return LoginResponse with JWT
  ↓
HTTP 200 OK
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "name": "John",
  "email": "john@example.com",
  "role": "STUDENT"
}
  ↓
Client stores token
  ↓
Subsequent Request to Protected Endpoint
GET /api/protected/user-profile
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9...
  ↓
JwtAuthenticationFilter
  ├─ Extract token from header
  ├─ Validate token (JwtUtil)
  ├─ Load user (CustomUserDetailsService)
  └─ Set authentication
  ↓
@PreAuthorize check
  ├─ Verify user has required role
  └─ Allow or deny access
  ↓
HTTP 200 / 403
```

---

## Key Design Decisions

### 1. Role Assignment
- **Decision**: Automatically assign STUDENT role during registration
- **Reason**: Prevents privilege escalation; ADMIN accounts created manually
- **Implementation**: Hard-coded in AuthService.register()

### 2. Password Encoding
- **Decision**: Use BCrypt with 10 rounds
- **Reason**: Industry standard, secure, allows password verification
- **Implementation**: BCryptPasswordEncoder in SecurityConfig

### 3. JWT Authentication
- **Decision**: Use HS512 algorithm (symmetric)
- **Reason**: Suitable for internal services; fast verification
- **Consideration**: Use RS256 for public-facing APIs

### 4. Stateless Session
- **Decision**: SessionCreationPolicy.STATELESS
- **Reason**: Scalable, no server-side session storage needed
- **Benefit**: Works well with microservices and load balancing

### 5. DTO Separation
- **Decision**: Separate DTOs from entities
- **Reason**: Decouples API contract from database schema
- **Benefit**: Can change database without breaking API

### 6. Custom Exceptions
- **Decision**: Create domain-specific exceptions
- **Reason**: Clear error handling; easily distinguishable exceptions
- **Implementation**: All caught by GlobalExceptionHandler

### 7. Email as Username
- **Decision**: Use email as username in Spring Security
- **Reason**: More user-friendly than user ID
- **Implementation**: email is stored in JWT subject claim

### 8. Role with Authority
- **Decision**: Convert Role enum to GrantedAuthority with ROLE_ prefix
- **Reason**: Spring Security standard; enables @PreAuthorize annotations
- **Implementation**: CustomUserDetailsService.CustomUserDetails.getAuthorities()

---

## Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | Spring Boot | 4.1.0 |
| Security | Spring Security | Latest |
| JWT | JJWT | 0.12.3 |
| Database | MySQL | 8.0+ |
| ORM | JPA/Hibernate | Latest |
| Java | OpenJDK | 21 |
| Build | Maven | 3.6+ |
| Utilities | Lombok | Latest |

---

## Security Features Implemented

✅ BCrypt password hashing
✅ JWT token-based authentication
✅ Role-based authorization
✅ CSRF protection disabled (appropriate for stateless API)
✅ Stateless session management
✅ Input validation
✅ Email uniqueness enforcement
✅ Secure token expiration
✅ Unauthorized access handling
✅ Exception handling with appropriate HTTP status codes

---

## Testing Recommendations

### Manual Testing
- Register new user
- Login with valid credentials
- Login with invalid credentials
- Register duplicate email
- Access protected endpoint with/without token
- Test with expired token

### Automated Testing
- Unit tests for AuthService
- Unit tests for JwtUtil
- Integration tests for AuthController
- Security filter tests

---

## Future Enhancements

1. ✏️ Implement refresh tokens
2. ✏️ Add two-factor authentication
3. ✏️ OAuth2 integration
4. ✏️ Email verification on registration
5. ✏️ Password reset functionality
6. ✏️ Rate limiting on auth endpoints
7. ✏️ Account lockout after failed attempts
8. ✏️ Audit logging
9. ✏️ Fine-grained role-based access control (RBAC)
10. ✏️ OpenAPI/Swagger documentation

---

## Summary

The authentication module provides a production-ready, secure authentication system with:
- User registration with automatic STUDENT role assignment
- JWT-based login and authentication
- BCrypt password encoding
- Role-based authorization
- Comprehensive error handling
- Clean, maintainable code structure

All files follow Spring Boot best practices and are ready for integration with the rest of the application.

