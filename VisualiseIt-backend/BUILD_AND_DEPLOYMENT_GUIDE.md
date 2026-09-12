# Build & Deployment Guide

## Prerequisites

### Required Software
- **Java**: JDK 21 or higher
  ```bash
  java -version
  ```
- **Maven**: 3.6.0 or higher
  ```bash
  mvn -version
  ```
- **MySQL**: 8.0 or higher
  ```bash
  mysql --version
  ```

### Optional Tools
- **Git**: For version control
- **Postman**: For API testing
- **cURL**: For command-line API testing

---

## Step 1: Database Setup

### 1.1 Start MySQL Server

**Windows (Command Prompt as Admin)**:
```bash
net start MySQL80
```

**macOS (Homebrew)**:
```bash
brew services start mysql@8.0
```

**Linux (Ubuntu/Debian)**:
```bash
sudo systemctl start mysql
```

### 1.2 Login to MySQL

```bash
mysql -u root -p
# Enter password: root@123
```

### 1.3 Create Database

```sql
CREATE DATABASE educate_db;
EXIT;
```

### 1.4 Verify Database

```bash
mysql -u root -p educate_db -e "SHOW TABLES;"
```

---

## Step 2: Configure Application

### 2.1 Update application.properties

**File**: `src/main/resources/application.properties`

```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/educate_db
spring.datasource.username=root
spring.datasource.password=root@123

# JWT Configuration
app.jwt.secret=MySecretKeyForJWTAuthenticationTokenGenerationAndValidationPurposeOnly12345
app.jwt.expiration=86400000

# Server Port
server.port=8080
```

### 2.2 Important Security Note

⚠️ **Production**: Change these values before deploying:
- `spring.datasource.password`
- `app.jwt.secret` (use a strong random key)
- Database URL (if not localhost)

---

## Step 3: Build Project

### 3.1 Clean Build

Navigate to project root (where `pom.xml` is located):

```bash
cd c:\Users\SHIPRA\Desktop\educate\educate-backend\educate-backend
```

### 3.2 Build with Maven

```bash
mvn clean install
```

**Output**: `target/educate-backend-0.0.1-SNAPSHOT.jar`

### 3.3 Skip Tests (Optional)

If you want to skip running tests during build:

```bash
mvn clean install -DskipTests
```

### 3.4 Troubleshooting Build Issues

**Issue**: "JAVA_HOME not found"
```bash
# Set JAVA_HOME (Windows)
set JAVA_HOME=C:\Program Files\Java\jdk-21
set PATH=%JAVA_HOME%\bin;%PATH%
```

**Issue**: Maven not found
```bash
# Add Maven to PATH (Windows)
set PATH=C:\Program Files\Maven\apache-maven-3.8.1\bin;%PATH%
```

---

## Step 4: Run Application

### Method 1: Using Maven

```bash
mvn spring-boot:run
```

### Method 2: Using Java Command

```bash
java -jar target/educate-backend-0.0.1-SNAPSHOT.jar
```

### Method 3: Using IDE

In VS Code or IntelliJ:
1. Open project
2. Find `EducateBackendApplication.java`
3. Click "Run" button
4. Application starts on http://localhost:8080

### Expected Output

```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_|\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v4.1.0)

2024-01-15 10:30:45.123 INFO com.example.educate_backend.EducateBackendApplication : Starting EducateBackendApplication
2024-01-15 10:30:47.234 INFO o.s.s.web.DefaultSecurityFilterChain : Will secure any request with [...]
2024-01-15 10:30:47.567 INFO o.s.b.w.embedded.tomcat.TomcatWebServer : Tomcat started on port(s): 8080
2024-01-15 10:30:47.890 INFO com.example.educate_backend.EducateBackendApplication : Started EducateBackendApplication in 2.345 seconds
```

### Successful Start Indicators

✅ No errors in console
✅ "Tomcat started on port(s): 8080"
✅ Application ready to receive requests

---

## Step 5: Verify Application

### 5.1 Health Check

```bash
curl http://localhost:8080/api/auth/health
```

Expected Response:
```
Auth service is up and running
```

### 5.2 Check Database Connection

```bash
curl http://localhost:8080/api/auth/health -v
```

Look for database queries in logs.

### 5.3 Test Registration

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

Expected Response (HTTP 201):
```json
{
    "id": 1,
    "name": "Test User",
    "email": "test@example.com",
    "role": "STUDENT",
    "message": "User registered successfully"
}
```

---

## Step 6: Test API Endpoints

### 6.1 Using cURL

#### Register User
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### Login User
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### Copy Token from Response and Use It
```bash
curl -X GET http://localhost:8080/api/protected/user-profile \
  -H "Authorization: Bearer <TOKEN_HERE>"
```

### 6.2 Using Postman

1. Open Postman
2. Create new request
3. Select POST method
4. URL: `http://localhost:8080/api/auth/login`
5. Headers:
   - Key: `Content-Type`
   - Value: `application/json`
6. Body (raw JSON):
   ```json
   {
     "email": "john@example.com",
     "password": "password123"
   }
   ```
7. Send request

---

## Step 7: Viewing Logs

### 7.1 Real-time Logs

Logs appear in console when running with Maven or IDE.

### 7.2 Log Levels

Configure in `application.properties`:
```properties
logging.level.root=INFO
logging.level.com.example.educate_backend=DEBUG
```

### 7.3 Log File Output

Add to `application.properties`:
```properties
logging.file.name=logs/application.log
```

---

## Troubleshooting

### Issue: Port 8080 Already in Use

**Solution 1**: Use different port
```properties
server.port=8081
```

**Solution 2**: Kill process using port
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :8080
kill -9 <PID>
```

### Issue: MySQL Connection Failed

**Check**:
1. MySQL server is running
2. Database exists: `mysql -u root -p -e "SHOW DATABASES;"`
3. Database credentials in `application.properties`

**Solution**:
```bash
# Restart MySQL
net stop MySQL80
net start MySQL80

# Recreate database
mysql -u root -p
CREATE DATABASE educate_db;
```

### Issue: Table Not Created

**Solution**: Enable SQL logging
```properties
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```

### Issue: Build Fails

```bash
# Clear Maven cache
mvn clean

# Update dependencies
mvn dependency:resolve

# Rebuild
mvn clean install
```

### Issue: JWT Secret Too Short

**Error**:
```
Illegal key size or default parameters
```

**Solution**:
```properties
# Use at least 32 characters
app.jwt.secret=YourSecretKeyMustBeAtLeast32CharactersLong123456
```

---

## Production Deployment

### Pre-Deployment Checklist

- [ ] Change database credentials
- [ ] Change JWT secret (use strong random key)
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set appropriate logging levels
- [ ] Update server port if needed
- [ ] Configure database backups
- [ ] Test all endpoints
- [ ] Review security settings
- [ ] Set up monitoring

### Deployment Options

#### Option 1: Docker

Create `Dockerfile`:
```dockerfile
FROM openjdk:21-slim
COPY target/educate-backend-0.0.1-SNAPSHOT.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
```

Build and run:
```bash
docker build -t educate-backend .
docker run -p 8080:8080 educate-backend
```

#### Option 2: Cloud Deployment

- **AWS**: Deploy as EC2 instance or using Elastic Beanstalk
- **Azure**: App Service or Container Instances
- **Google Cloud**: Compute Engine or Cloud Run
- **Heroku**: Platform-as-a-Service

#### Option 3: Traditional Server

1. Copy JAR file to server
2. Set environment variables
3. Run with `java -jar`
4. Use systemd or similar for auto-restart

---

## Performance Optimization

### Database Indexing

```sql
-- Add indexes for frequently searched columns
ALTER TABLE users ADD INDEX idx_email (email);
ALTER TABLE users ADD INDEX idx_role (role);
```

### Connection Pooling

```properties
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=5
```

### Caching

Enable query caching:
```properties
spring.jpa.properties.hibernate.generate_statistics=true
```

---

## Monitoring

### Application Monitoring

```bash
# Check application health
curl http://localhost:8080/api/auth/health

# View logs
tail -f logs/application.log

# Monitor database
mysql -u root -p
SHOW PROCESSLIST;
```

### Metrics

Enable metrics endpoint:
```properties
management.endpoints.web.exposure.include=health,metrics
```

Access metrics:
```bash
curl http://localhost:8080/actuator/metrics
```

---

## Maintenance

### Database Backup

```bash
mysqldump -u root -p educate_db > backup_$(date +%Y%m%d).sql
```

### Restore from Backup

```bash
mysql -u root -p educate_db < backup_20240115.sql
```

### Update Application

```bash
git pull
mvn clean install
# Restart application
```

---

## Summary

✅ Prerequisites installed
✅ Database created and configured
✅ Application properties updated
✅ Project built successfully
✅ Application running on port 8080
✅ API endpoints tested
✅ Database operations verified

Your authentication module is now ready for use!

