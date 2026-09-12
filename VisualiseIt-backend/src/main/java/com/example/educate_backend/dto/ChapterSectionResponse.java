package com.example.educate_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChapterSectionResponse {
    private Integer id;
    private String heading;
    private String content;
    private String visualizationId;
}
