package com.example.educate_backend.controller;

import com.example.educate_backend.dto.SettingsResponse;
import com.example.educate_backend.dto.StudyActivityRequest;
import com.example.educate_backend.dto.ActivityCalendarResponse;
import com.example.educate_backend.dto.UpdateProfileRequest;
import com.example.educate_backend.dto.ProfileResponse;
import com.example.educate_backend.dto.DashboardResponse;
import com.example.educate_backend.dto.TopicRecommendationResponse;
import com.example.educate_backend.dto.WebsiteVisitRequest;
import com.example.educate_backend.service.QuizService;
import com.example.educate_backend.service.RecommendationService;
import com.example.educate_backend.service.StudyActivityService;
import com.example.educate_backend.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.DateTimeException;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.List;

@RestController
@RequestMapping("/api/user")
@Slf4j
@CrossOrigin(origins = "*") // Allow requests from any origin for development purposes
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private QuizService quizService;

    @Autowired
    private StudyActivityService studyActivityService;

    @Autowired
    private RecommendationService recommendationService;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> getDashboard() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(quizService.getDashboard(authentication.getName()));
    }

    @GetMapping("/recommendations")
    public ResponseEntity<List<TopicRecommendationResponse>> getRecommendations(
            @RequestParam(required = false) Integer classId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(recommendationService.getRecommendations(authentication.getName(), classId));
    }

    @GetMapping("/activity")
    public ResponseEntity<ActivityCalendarResponse> getActivityCalendar(
            @RequestParam String month, @RequestParam String timeZone) {
        YearMonth requestedMonth;
        ZoneId requestedTimeZone;
        try {
            requestedMonth = YearMonth.parse(month);
            requestedTimeZone = ZoneId.of(timeZone);
        } catch (DateTimeException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "A valid month and time zone are required", exception);
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(new ActivityCalendarResponse(
                studyActivityService.getCalendarActivity(authentication.getName(), requestedMonth, requestedTimeZone)));
    }

    @PostMapping("/visit")
    public ResponseEntity<Void> recordWebsiteVisit(@RequestBody WebsiteVisitRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        studyActivityService.recordVisit(authentication.getName(), request.date());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/study-activity/{chapterId}")
    public ResponseEntity<Void> recordStudyActivity(
            @PathVariable Long chapterId,
            @RequestBody StudyActivityRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        studyActivityService.record(authentication.getName(), chapterId, request.seconds(), request.date());
        return ResponseEntity.noContent().build();
    }

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
