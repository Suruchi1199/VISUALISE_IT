package com.example.educate_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * SettingsResponse DTO.
 * Contains user settings information.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SettingsResponse {
    private String name;
    private String email;
    private Integer dailyGoal;
    private String theme; // light, dark, or auto
    private Boolean notifications;
    private Boolean emailNotifications;
}
