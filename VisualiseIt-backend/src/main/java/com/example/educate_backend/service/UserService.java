package com.example.educate_backend.service;

import com.example.educate_backend.dto.SettingsResponse;
import com.example.educate_backend.dto.UpdateProfileRequest;
import com.example.educate_backend.dto.ProfileResponse;
import com.example.educate_backend.model.User;
import com.example.educate_backend.model.UserSettings;
import com.example.educate_backend.Repository.UserRepository;
import com.example.educate_backend.Repository.UserSettingsRepository;
import com.example.educate_backend.exception.UserNotFoundException;
import com.example.educate_backend.exception.EmailAlreadyExistsException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * User Service.
 * Handles user-related business logic including settings management.
 */
@Service
@Slf4j
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserSettingsRepository userSettingsRepository;

    /**
     * Get user settings by email.
     * @param email the user's email
     * @return SettingsResponse with user settings
     * @throws UserNotFoundException if user is not found
     */
    public SettingsResponse getUserSettings(String email) {
        log.info("Fetching settings for user: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.error("User not found with email: {}", email);
                    return new UserNotFoundException("User not found with email: " + email);
                });

        UserSettings settings = userSettingsRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    log.info("Settings not found for user: {}, creating default settings", email);
                    // Create default settings if they don't exist
                    UserSettings defaultSettings = new UserSettings();
                    defaultSettings.setUser(user);
                    defaultSettings.setDailyGoal(0);
                    defaultSettings.setTheme("auto");
                    defaultSettings.setNotifications(true);
                    defaultSettings.setEmailNotifications(true);
                    return userSettingsRepository.save(defaultSettings);
                });

        SettingsResponse response = new SettingsResponse(
                user.getName(),
                user.getEmail(),
                settings.getDailyGoal(),
                settings.getTheme(),
                settings.getNotifications(),
                settings.getEmailNotifications()
        );

        log.info("Settings retrieved successfully for user: {}", email);
        return response;
    }

    /**
     * Update user profile (name and email).
     * @param currentEmail the user's current email
     * @param updateProfileRequest the update request with new name and email
     * @return ProfileResponse with updated user details
     * @throws UserNotFoundException if user is not found
     * @throws EmailAlreadyExistsException if new email is already in use
     */
    public ProfileResponse updateUserProfile(String currentEmail, UpdateProfileRequest updateProfileRequest) {
        log.info("Updating profile for user: {}", currentEmail);

        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> {
                    log.error("User not found with email: {}", currentEmail);
                    return new UserNotFoundException("User not found with email: " + currentEmail);
                });

        // Update name if provided
        if (StringUtils.hasText(updateProfileRequest.getName())) {
            user.setName(updateProfileRequest.getName());
            log.info("Updated name to: {}", updateProfileRequest.getName());
        }

        // Update email if provided and different from current
        if (StringUtils.hasText(updateProfileRequest.getEmail()) && 
            !updateProfileRequest.getEmail().equals(currentEmail)) {
            
            // Check if new email already exists
            if (userRepository.existsByEmail(updateProfileRequest.getEmail())) {
                log.warn("Email already exists: {}", updateProfileRequest.getEmail());
                throw new EmailAlreadyExistsException("Email already in use: " + updateProfileRequest.getEmail());
            }
            
            user.setEmail(updateProfileRequest.getEmail());
            log.info("Updated email to: {}", updateProfileRequest.getEmail());
        }

        User updatedUser = userRepository.save(user);
        log.info("User profile updated successfully for user: {}", updatedUser.getEmail());

        return new ProfileResponse(
                updatedUser.getId(),
                updatedUser.getName(),
                updatedUser.getEmail(),
                updatedUser.getRole().toString(),
                "Profile updated successfully"
        );
    }
}

