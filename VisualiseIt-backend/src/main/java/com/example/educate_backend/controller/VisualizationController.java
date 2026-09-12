package com.example.educate_backend.controller;

import com.example.educate_backend.dto.VisualizationResponse;
import com.example.educate_backend.service.VisualizationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@Slf4j
public class VisualizationController {

    @Autowired
    private VisualizationService visualizationService;

    @GetMapping("/api/chapters/{chapterId}/visualizations")
    public ResponseEntity<List<VisualizationResponse>> getVisualizationsByChapter(@PathVariable Long chapterId) {
        log.info("GET /api/chapters/{}/visualizations called", chapterId);
        List<VisualizationResponse> visualizations = visualizationService.getVisualizationsByChapterId(chapterId);
        return new ResponseEntity<>(visualizations, HttpStatus.OK);
    }
}
