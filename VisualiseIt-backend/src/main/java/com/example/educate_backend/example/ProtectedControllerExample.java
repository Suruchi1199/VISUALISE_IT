package com.example.educate_backend.example;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import lombok.extern.slf4j.Slf4j;

/**
 * Example Protected Controller
 * 
 * This is an example showing how to create protected endpoints that require authentication
 * and authorization. Use this as a reference for creating other protected endpoints.
 * 
 * NOTE: This is an example file. Remove or refactor for production use.
 */
@RestController
@RequestMapping("/api/protected")
@Slf4j
public class ProtectedControllerExample {

    /**
     * Endpoint accessible to authenticated users (both STUDENT and ADMIN)
     * Requires: Valid JWT token
     */
    @GetMapping("/user-profile")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<String> getUserProfile() {
        log.info("Accessing user profile");
        return ResponseEntity.ok("User profile data");
    }

    /**
     * Endpoint accessible only to ADMIN users
     * Requires: Valid JWT token with ADMIN role
     */
    @GetMapping("/admin-panel")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> getAdminPanel() {
        log.info("Accessing admin panel");
        return ResponseEntity.ok("Admin panel data");
    }

    /**
     * Endpoint accessible only to STUDENT users
     * Requires: Valid JWT token with STUDENT role
     */
    @GetMapping("/student-dashboard")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<String> getStudentDashboard() {
        log.info("Accessing student dashboard");
        return ResponseEntity.ok("Student dashboard data");
    }

    /**
     * Endpoint accessible to authenticated users with specific role
     * Requires: Valid JWT token
     */
    @GetMapping("/courses")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> getCourses() {
        log.info("Fetching courses for authenticated user");
        return ResponseEntity.ok("List of courses");
    }
}

/**
 * Common @PreAuthorize Expressions:
 * 
 * 1. hasRole('ADMIN')
 *    - Only users with ADMIN role can access
 *    - Spring automatically adds "ROLE_" prefix
 * 
 * 2. hasAnyRole('STUDENT', 'ADMIN')
 *    - Users with either STUDENT or ADMIN role can access
 * 
 * 3. hasAuthority('ADMIN')
 *    - Same as hasRole() but without automatic prefix
 * 
 * 4. isAuthenticated()
 *    - Any authenticated user can access
 * 
 * 5. permitAll()
 *    - Anyone can access (use in SecurityConfig)
 * 
 * 6. denyAll()
 *    - No one can access
 * 
 * 7. hasRole('ADMIN') && hasAnyRole('TEACHER', 'MENTOR')
 *    - Complex expressions using AND (&& or and)
 * 
 * 8. hasRole('ADMIN') || hasRole('MODERATOR')
 *    - Complex expressions using OR (|| or or)
 * 
 * Example: Complex Authorization
 * @PreAuthorize("hasRole('ADMIN') || (hasRole('STUDENT') && #studentId == principal.user.id)")
 * public ResponseEntity<?> getStudentData(@PathVariable Long studentId) { ... }
 */

/**
 * Getting Current User Information:
 * 
 * In your controller/service, you can access the authenticated user:
 * 
 * Option 1: Using SecurityContextHolder
 * ```
 * UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext()
 *     .getAuthentication().getPrincipal();
 * String email = userDetails.getUsername();
 * ```
 * 
 * Option 2: Using CustomUserDetailsService.CustomUserDetails
 * ```
 * CustomUserDetailsService.CustomUserDetails userDetails = 
 *     (CustomUserDetailsService.CustomUserDetails) SecurityContextHolder.getContext()
 *     .getAuthentication().getPrincipal();
 * User user = userDetails.getUser();
 * String email = user.getEmail();
 * String role = user.getRole().toString();
 * ```
 * 
 * Option 3: Using Principal in Method Parameter
 * ```
 * @GetMapping("/profile")
 * public ResponseEntity<?> getUserProfile(Principal principal) {
 *     String email = principal.getName();
 *     // principal.getName() returns the username (email in our case)
 *     return ResponseEntity.ok("User: " + email);
 * }
 * ```
 */

/**
 * Authorization Flow:
 * 
 * 1. Client sends request with Authorization header containing JWT token
 *    Request: GET /api/protected/user-profile
 *    Header: Authorization: Bearer eyJhbGc...
 * 
 * 2. JwtAuthenticationFilter intercepts the request
 *    - Extracts JWT from Authorization header
 *    - Validates token signature and expiration
 * 
 * 3. If token is valid, filter extracts user information
 *    - Email from token claims
 *    - Loads user details from database using CustomUserDetailsService
 *    - Creates authentication token with user details
 *    - Sets authentication in SecurityContext
 * 
 * 4. DispatcherServlet routes request to controller
 * 
 * 5. @PreAuthorize("hasRole('STUDENT')") annotation checks authority
 *    - Verifies user has ROLE_STUDENT authority
 *    - If not, throws AccessDeniedException (403)
 *    - If yes, method executes
 * 
 * 6. Response sent back to client
 */
