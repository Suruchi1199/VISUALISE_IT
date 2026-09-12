package com.example.educate_backend.controller;

import com.example.educate_backend.dto.ClassResponse;
import com.example.educate_backend.service.SchoolClassService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controller for class-related API endpoints.
 */
@RestController
@RequestMapping("/api/classes")
@CrossOrigin(origins = "*")
@Slf4j
public class SchoolClassController {

    @Autowired
    private SchoolClassService schoolClassService;

    @GetMapping
    public ResponseEntity<List<ClassResponse>> getAllClasses() {
        log.info("GET /api/classes called");
        List<ClassResponse> classes = schoolClassService.getAllClasses();
        return new ResponseEntity<>(classes, HttpStatus.OK);
    }
}
