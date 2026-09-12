package com.example.educate_backend.service;

import com.example.educate_backend.Repository.VisualizationRepository;
import com.example.educate_backend.dto.VisualizationResponse;
import com.example.educate_backend.model.Visualization;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class VisualizationService {

    private final VisualizationRepository visualizationRepository;

    public List<VisualizationResponse> getVisualizationsByChapterId(Long chapterId) {
        log.info("Fetching visualizations for chapter: {}", chapterId);
        return visualizationRepository.findByChapter_IdOrderByIdAsc(chapterId)
                .stream()
                .map(this::mapVisualizationToResponse)
                .collect(Collectors.toList());
    }

    private VisualizationResponse mapVisualizationToResponse(Visualization visualization) {
        return new VisualizationResponse(
                visualization.getId(),
                visualization.getTitle(),
                visualization.getType(),
                visualization.getDescription(),
                visualization.getData()
        );
    }
}
