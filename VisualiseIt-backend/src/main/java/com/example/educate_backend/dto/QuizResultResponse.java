package com.example.educate_backend.dto;

public record QuizResultResponse(int score, int totalQuestions, int percentage, boolean passed,
                                 int xpEarned, int totalXp, boolean chapterCompleted, boolean alreadyCompleted) {}
