package com.example.educate_backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record DashboardResponse(int totalXp, int completedChapters, int quizzesCompleted,
                                int averageScore, int inProgressChapters, int weeklyStudyMinutes,
                                int monthlyStudyMinutes,
                                List<DailyStudyResponse> weeklyActivity,
                                List<DailyStudyResponse> monthlyActivity,
                                List<SubjectProgressResponse> subjectProgress,
                                List<RecentActivityResponse> recentActivity,
                                List<CompletedChapterResponse> recentCompletions) {
    public record DailyStudyResponse(LocalDate date, int studyMinutes) {}

    public record SubjectProgressResponse(Long subjectId, String subjectName, Long classId,
                                          String className, int totalChapters, int completedChapters,
                                          int progressPercentage, Long nextChapterId,
                                          String nextChapterTitle) {}

    public record RecentActivityResponse(Long chapterId, String chapterTitle, Long subjectId,
                                         String subjectName, Long classId, int studySeconds,
                                         LocalDateTime lastAccessed, boolean completed) {}

    public record CompletedChapterResponse(Long chapterId, String chapterTitle, int score,
                                           int totalQuestions, int xpEarned, Long subjectId,
                                           String subjectName, Long classId) {}
}
