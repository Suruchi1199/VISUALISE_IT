package com.example.educate_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChapterSectionResponse {
    private Integer id;
    private String heading;
    private String content;
    private String visualizationId;
    private String summary;
    private List<String> keyPoints;
    private Map<String, Object> visualizationData;
}
