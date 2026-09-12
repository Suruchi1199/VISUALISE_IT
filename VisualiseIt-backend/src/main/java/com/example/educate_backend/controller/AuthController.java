package com.example.educate_backend.controller;

import com.example.educate_backend.dto.RegisterRequest;
import com.example.educate_backend.dto.LoginRequest;
import com.example.educate_backend.dto.LoginResponse;
import com.example.educate_backend.dto.RegisterResponse;
import com.example.educate_backend.service.AuthService;
import com.example.educate_backend.exception.InvalidInputException;
import com.example.educate_backend.exception.EmailAlreadyExistsException;
import com.example.educate_backend.exception.AuthenticationException;
import com.example.educate_backend.exception.UserNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication Controller.
 * Handles user registration and login endpoints.
 * Base URL: /api/auth
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@Slf4j
public class AuthController {

    @Autowired
    private AuthService authService;

    /**
     * Register a new user. 
     * Endpoint: POST /api/auth/register
     * Request body: RegisterRequest (name, email, password)
     * Response: RegisterResponse with user details and success message
     *
     * @param registerRequest the registration request
     * @return ResponseEntity with RegisterResponse and 201 CREATED status
     */
    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@RequestBody RegisterRequest registerRequest) {
        
        log.info("Received registration request for email: {}", registerRequest.getEmail());

        try {
            RegisterResponse response = authService.register(registerRequest);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (InvalidInputException e) {
            log.warn("Invalid input in registration: {}", e.getMessage());
            RegisterResponse errorResponse = new RegisterResponse(
                    null, null, null, null, "Error: " + e.getMessage()
            );
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        } catch (EmailAlreadyExistsException e) {
            log.warn("Registration failed: {}", e.getMessage());
            RegisterResponse errorResponse = new RegisterResponse(
                    null, null, registerRequest.getEmail(), null, "Error: " + e.getMessage()
            );
            return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
        }
    }

    /**
     * Authenticate user and generate JWT token.
     * Endpoint: POST /api/auth/login
     * Request body: LoginRequest (email, password)
     * Response: LoginResponse with JWT token and user details
     *
     * @param loginRequest the login request
     * @return ResponseEntity with LoginResponse and 200 OK status
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        log.info("Received login request for email: {}", loginRequest.getEmail());

        try {
            LoginResponse response = authService.login(loginRequest);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (InvalidInputException e) {
            log.warn("Invalid input in login: {}", e.getMessage());
            return new ResponseEntity<>(new LoginResponse(), HttpStatus.BAD_REQUEST);
        } catch (UserNotFoundException e) {
            log.warn("Login failed: User not found");
            return new ResponseEntity<>(new LoginResponse(), HttpStatus.UNAUTHORIZED);
        } catch (AuthenticationException e) {
            log.warn("Login failed: Authentication error");
            return new ResponseEntity<>(new LoginResponse(), HttpStatus.UNAUTHORIZED);
        }
    }

    /**
     * Health check endpoint.
     * Endpoint: GET /api/auth/health
     * @return ResponseEntity with health status
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        log.debug("Health check endpoint called");
        return new ResponseEntity<>("Auth service is up and running", HttpStatus.OK);
    }
}
