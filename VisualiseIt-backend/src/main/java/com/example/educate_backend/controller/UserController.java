package com.example.educate_backend.controller;

import com.example.educate_backend.dto.SettingsResponse;
import com.example.educate_backend.dto.UpdateProfileRequest;
import com.example.educate_backend.dto.ProfileResponse;
import com.example.educate_backend.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
@Slf4j
@CrossOrigin(origins = "*") // Allow requests from any origin for development purposes
public class UserController {

    @Autowired
    private UserService userService;

    /**
     * Update user profile (name and email).
     * Requires authentication with valid JWT token.
     * @param updateProfileRequest contains name and email to update
     * @return ProfileResponse with updated user details
     */
    @PutMapping("/profile")
    public ResponseEntity<ProfileResponse> updateUserProfile(@RequestBody UpdateProfileRequest updateProfileRequest) {
        log.info("Updating user profile");

        // Get authenticated user email from security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentEmail = authentication.getName();

        log.info("Current user email from authentication: {}", currentEmail);

        // Update user profile
        ProfileResponse profileResponse = userService.updateUserProfile(currentEmail, updateProfileRequest);

        return new ResponseEntity<>(profileResponse, HttpStatus.OK);
    }

    /**
     * Get user settings.
     * Requires authentication with valid JWT token.
     * @return SettingsResponse containing user settings
     */
    @GetMapping("/settings")
    public ResponseEntity<SettingsResponse> getUserSettings() {
        log.info("Fetching user settings");

        // Get authenticated user email from security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        log.info("User email from authentication: {}", email);

        // Fetch user settings
        SettingsResponse settings = userService.getUserSettings(email);

        return new ResponseEntity<>(settings, HttpStatus.OK);
    }
}
