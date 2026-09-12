package com.example.educate_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChapterResponse {
    private Long id;
    private Integer chapterNumber;
    private String title;
    private String description;
}
