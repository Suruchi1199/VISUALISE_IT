package com.example.educate_backend.dto;

import java.util.Map;

public record QuizSubmissionRequest(Map<String, String> answers) {}
