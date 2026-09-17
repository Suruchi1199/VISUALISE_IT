package com.example.educate_backend.dto;

import java.util.List;

public record DashboardResponse(int totalXp, int completedChapters, int quizzesCompleted,
                                int averageScore, List<CompletedChapterResponse> recentCompletions) {
    public record CompletedChapterResponse(Long chapterId, String chapterTitle, int score,
                                           int totalQuestions, int xpEarned) {}
}
