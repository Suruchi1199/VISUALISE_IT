package com.example.educate_backend.service;

import com.example.educate_backend.dto.RegisterRequest;
import com.example.educate_backend.dto.LoginRequest;
import com.example.educate_backend.dto.LoginResponse;
import com.example.educate_backend.dto.RegisterResponse;
import com.example.educate_backend.model.User;
import com.example.educate_backend.model.Role;
import com.example.educate_backend.Repository.UserRepository;
import com.example.educate_backend.exception.EmailAlreadyExistsException;
import com.example.educate_backend.exception.InvalidInputException;
import com.example.educate_backend.exception.AuthenticationException;
import com.example.educate_backend.exception.UserNotFoundException;
import com.example.educate_backend.security.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * Authentication Service.
 * Handles user registration and login logic.
 */
@Service
@Slf4j
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Register a new user.
     * Validates input, checks for duplicate email, encodes password, and saves user with STUDENT role.
     * @param registerRequest the registration request
     * @return RegisterResponse with user details
     * @throws InvalidInputException if input is invalid
     * @throws EmailAlreadyExistsException if email already exists
     */
    public RegisterResponse register(RegisterRequest registerRequest) {
        log.info("Registering new user with email: {}", registerRequest.getEmail());

        // Validate input
        validateRegisterRequest(registerRequest);

        // Check if email already exists
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            log.warn("Attempted registration with existing email: {}", registerRequest.getEmail());
            throw new EmailAlreadyExistsException("Email already registered: " + registerRequest.getEmail());
        }

        // Create new user
        User user = new User();
        user.setName(registerRequest.getName());
        user.setEmail(registerRequest.getEmail());
        // Encode password using BCrypt
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        // Always assign STUDENT role during registration
        user.setRole(Role.STUDENT);

        // Save user
        User savedUser = userRepository.save(user);
        log.info("User registered successfully with email: {} and ID: {}", savedUser.getEmail(), savedUser.getId());

        // Build response
        return new RegisterResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole().toString(),
                "User registered successfully"
        );
    }

    /**
     * Authenticate user and generate JWT token.
     * Finds user by email, verifies password, and generates JWT token.
     * @param loginRequest the login request
     * @return LoginResponse with JWT token and user details
     * @throws UserNotFoundException if user not found
     * @throws AuthenticationException if password is incorrect
     */

    public LoginResponse login(LoginRequest loginRequest) {
        log.info("Login attempt for email: {}", loginRequest.getEmail());

        // Validate input
        validateLoginRequest(loginRequest);

        // Find user by email
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> {
                    log.warn("Login failed: User not found with email: {}", loginRequest.getEmail());
                    return new UserNotFoundException("User not found with email: " + loginRequest.getEmail());
                });

        // Verify password

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            log.warn("Login failed: Invalid password for email: {}", loginRequest.getEmail());
            throw new AuthenticationException("Invalid email or password");
        }

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().toString());
        log.info("JWT token generated successfully for user: {}", user.getEmail());

        // Build response
        return new LoginResponse(
                token,
                user.getName(),
                user.getEmail(),
                user.getRole().toString()
        );
    }

    /**
     * Validate registration request.
     * @param registerRequest the registration request to validate
     * @throws InvalidInputException if any field is invalid
     */
    private void validateRegisterRequest(RegisterRequest registerRequest) {
        if (!StringUtils.hasText(registerRequest.getName())) {
            throw new InvalidInputException("Name is required");
        }
        if (!StringUtils.hasText(registerRequest.getEmail())) {
            throw new InvalidInputException("Email is required");
        }
        if (!isValidEmail(registerRequest.getEmail())) {
            throw new InvalidInputException("Email format is invalid");
        }
        if (!StringUtils.hasText(registerRequest.getPassword())) {
            throw new InvalidInputException("Password is required");
        }
        if (registerRequest.getPassword().length() < 6) {
            throw new InvalidInputException("Password must be at least 6 characters long");
        }
    }

    /**
     * Validate login request.
     * @param loginRequest the login request to validate
     * @throws InvalidInputException if any field is invalid
     */
    private void validateLoginRequest(LoginRequest loginRequest) {
        if (!StringUtils.hasText(loginRequest.getEmail())) {
            throw new InvalidInputException("Email is required");
        }
        if (!isValidEmail(loginRequest.getEmail())) {
            throw new InvalidInputException("Email format is invalid");
        }
        if (!StringUtils.hasText(loginRequest.getPassword())) {
            throw new InvalidInputException("Password is required");
        }
    }

    /**
     * Simple email validation using regex.
     * @param email the email to validate
     * @return true if email format is valid
     */
    private boolean isValidEmail(String email) {
        String emailRegex = "^[A-Za-z0-9+_.-]+@(.+)$";
        return email.matches(emailRegex);
    }
}
