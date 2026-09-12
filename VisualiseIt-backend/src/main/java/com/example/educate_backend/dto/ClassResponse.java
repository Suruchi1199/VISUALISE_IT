package com.example.educate_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO representing a class entity returned by the API.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClassResponse {

    private String id;
    private String label;
    private String description;
    private String focus;
    private String highlight;
    private String color;
}
