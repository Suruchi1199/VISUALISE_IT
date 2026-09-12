package com.example.educate_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VisualizationResponse {
    private Long id;
    private String title;
    private String type;
    private String description;
    private String data;
}
