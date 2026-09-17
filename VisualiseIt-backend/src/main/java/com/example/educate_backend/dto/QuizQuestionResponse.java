package com.example.educate_backend.dto;

import java.util.List;

public record QuizQuestionResponse(String id, String question, List<String> options) {}
