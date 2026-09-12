# Quick Start Guide - Authentication Module

## Prerequisites
- Java 21 or higher
- Maven 3.6+
- MySQL 8.0+
- Postman or cURL (for testing)

## 5-Minute Setup

### 1. Database Setup
```sql
CREATE DATABASE educate_db;
```

### 2. Start Application
```bash
cd educate-backend
mvn clean install
mvn spring-boot:run
```

### 3. Test Registration
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 4. Test Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

Save the token from the response!

### 5. Use Token for Protected Endpoints
```bash
curl -X GET http://localhost:8080/api/some-endpoint \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Important Configuration

Update `src/main/resources/application.properties`:
```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/educate_db
spring.datasource.username=root
spring.datasource.password=your_password

# JWT Secret (generate a secure one!)
app.jwt.secret=YourSecretKeyAtLeast32CharactersLong123456789
```

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Connection refused | Ensure MySQL is running and database created |
| 409 Conflict | Email already registered, use different email |
| 401 Unauthorized | Token missing or expired, login again |
| Port 8080 in use | Change `server.port` in application.properties |

## Key Files Created

| File | Purpose |
|------|---------|
| `User.java` | Database entity with id, name, email, password, role |
| `Role.java` | Enum: STUDENT, ADMIN |
| `AuthService.java` | Business logic for register() and login() |
| `AuthController.java` | REST endpoints: /api/auth/register, /api/auth/login |
| `JwtUtil.java` | JWT token generation and validation |
| `SecurityConfig.java` | Spring Security configuration |
| `CustomUserDetailsService.java` | Load user from database |
| `DTOs` | RegisterRequest, LoginRequest, LoginResponse, RegisterResponse |

## Next Steps

1. ✅ Run the application
2. ✅ Test registration and login
3. ✅ Create protected endpoints using `@PreAuthorize("hasRole('STUDENT')")` 
4. ✅ Implement refresh token mechanism
5. ✅ Add email verification
6. ✅ Implement forgot password

## Testing Checklist

- [ ] Registration with valid data
- [ ] Registration with duplicate email (should fail)
- [ ] Registration with invalid email (should fail)
- [ ] Login with correct credentials
- [ ] Login with wrong password (should fail)
- [ ] Access protected endpoint without token (should fail)
- [ ] Access protected endpoint with valid token (should succeed)
- [ ] Access protected endpoint with expired token (should fail)

