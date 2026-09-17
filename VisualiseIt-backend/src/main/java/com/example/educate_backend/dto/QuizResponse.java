package com.example.educate_backend.dto;

import java.util.List;

public record QuizResponse(Long chapterId, String title, List<QuizQuestionResponse> questions) {}
