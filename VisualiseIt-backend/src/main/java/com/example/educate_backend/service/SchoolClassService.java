package com.example.educate_backend.service;

import com.example.educate_backend.Repository.SchoolClassRepository;
import com.example.educate_backend.dto.ClassResponse;
import com.example.educate_backend.model.SchoolClass;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service that manages available school classes.
 */
@Service
@Slf4j
public class SchoolClassService {

    @Autowired
    private SchoolClassRepository schoolClassRepository;

    public List<ClassResponse> getAllClasses() {
        log.info("Fetching all available classes");
        return schoolClassRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public void initializeDefaultClasses() {
        log.info("Initializing default classes if missing");

        var defaultClasses = List.of(
                new SchoolClass(null, 6, "Class 6", "A strong starting point for core ideas, steady practice, and confident subject exploration.", "Build comfort with fundamentals", "Best for learners starting middle-school concepts", "#e8a33d"),
                new SchoolClass(null, 7, "Class 7", "Move from basics into deeper problem-solving with guided lessons and clearer application.", "Strengthen conceptual connections", "Balances revision with new learning", "#4fd1c5"),
                new SchoolClass(null, 8, "Class 8", "Prepare for advanced school topics with structured practice and subject-wise progression.", "Bridge toward advanced chapters", "A balanced level for math, science, and computing", "#8f7ee8"),
                new SchoolClass(null, 9, "Class 9", "Start a more focused academic path with stronger science depth and measurable study goals.", "Sharpen analytical learning", "Ideal for pre-board preparation flow", "#e8615c"),
                new SchoolClass(null, 10, "Class 10", "Stay organized for board-level preparation with subject detail pages and quicker revision paths.", "Prepare with clarity and structure", "Built for focused final-year revision", "#6fb1e8")
        );

        for (SchoolClass defaultClass : defaultClasses) {
            SchoolClass existing = schoolClassRepository.findAll()
                    .stream()
                    .filter(c -> c.getGradeLevel().equals(defaultClass.getGradeLevel()))
                    .findFirst()
                    .orElse(null);

            if (existing == null) {
                schoolClassRepository.save(defaultClass);
                log.info("Created default class record: {}", defaultClass.getGradeLevel());
            } else if (!defaultClass.equals(existing)) {
                existing.setName(defaultClass.getName());
                existing.setDescription(defaultClass.getDescription());
                existing.setFocus(defaultClass.getFocus());
                existing.setHighlight(defaultClass.getHighlight());
                existing.setColor(defaultClass.getColor());
                schoolClassRepository.save(existing);
                log.info("Updated class record for grade level: {}", existing.getGradeLevel());
            }
        }
    }

    private ClassResponse mapToResponse(SchoolClass schoolClass) {
        return new ClassResponse(
                String.valueOf(schoolClass.getGradeLevel()),
                schoolClass.getName(),
                schoolClass.getDescription(),
                schoolClass.getFocus(),
                schoolClass.getHighlight(),
                schoolClass.getColor()
        );
    }
}
