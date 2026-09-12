package com.example.educate_backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * UserSettings Entity representing user preferences and settings.
 * Contains user preference details with a one-to-one relationship to User.
 */
@Entity
@Table(name = "user_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, columnDefinition = "INT DEFAULT 0")
    private Integer dailyGoal = 0; // Daily learning goal in minutes

    @Column(nullable = false, columnDefinition = "VARCHAR(10) DEFAULT 'auto'")
    private String theme = "auto"; // light, dark, or auto

    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT true")
    private Boolean notifications = true; // In-app notifications

    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT true")
    private Boolean emailNotifications = true; // Email notifications
}
