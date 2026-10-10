package com.example.educate_backend.service;

import com.example.educate_backend.Repository.ChapterProgressRepository;
import com.example.educate_backend.Repository.ChapterRepository;
import com.example.educate_backend.Repository.SchoolClassRepository;
import com.example.educate_backend.Repository.StudyActivityRepository;
import com.example.educate_backend.Repository.SubjectRepository;
import com.example.educate_backend.Repository.UserRepository;
import com.example.educate_backend.dto.TopicRecommendationResponse;
import com.example.educate_backend.model.Chapter;
import com.example.educate_backend.model.ChapterProgress;
import com.example.educate_backend.model.Subject;
import com.example.educate_backend.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class RecommendationService {
    private static final int MAX_RECOMMENDATIONS = 4;

    private final UserRepository userRepository;
    private final ChapterProgressRepository progressRepository;
    private final StudyActivityRepository activityRepository;
    private final SubjectRepository subjectRepository;
    private final ChapterRepository chapterRepository;
    private final SchoolClassRepository schoolClassRepository;

    @Transactional(readOnly = true)
    public List<TopicRecommendationResponse> getRecommendations(String email, Integer selectedClassId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Authenticated user was not found"));
        List<ChapterProgress> quizHistory =
                progressRepository.findByUser_IdOrderByCompletedAtDesc(user.getId());
        var studyHistory = activityRepository.findByUser_IdOrderByLastAccessedDesc(user.getId());
        Set<Long> completedChapterIds = quizHistory.stream()
                .filter(ChapterProgress::isCompleted)
                .map(progress -> progress.getChapter().getId())
                .collect(java.util.stream.Collectors.toSet());

        List<TopicRecommendationResponse> recommendations = new ArrayList<>();
        Set<Long> recommendedTopicIds = new HashSet<>();

        studyHistory.stream()
                .map(activity -> activity.getChapter())
                .filter(chapter -> !completedChapterIds.contains(chapter.getId()))
                .findFirst()
                .ifPresent(chapter -> add(recommendations, recommendedTopicIds, chapter, "CONTINUE",
                        "Continue the unfinished topic you accessed most recently.",
                        "Continue learning"));

        for (ChapterProgress progress : quizHistory) {
            if (!progress.isCompleted() || progress.getTotalQuestions() <= 0
                    || recommendations.size() >= MAX_RECOMMENDATIONS) {
                continue;
            }

            Chapter completedChapter = progress.getChapter();
            double percentage = progress.getScore() * 100.0 / progress.getTotalQuestions();
            int roundedPercentage = (int) Math.round(percentage);
            if (percentage < 50) {
                add(recommendations, recommendedTopicIds, completedChapter, "REVISE",
                        "Your quiz score was " + roundedPercentage
                                + "%. Review this topic, then retake its quiz.",
                        "Revise topic");
            } else if (percentage < 80) {
                add(recommendations, recommendedTopicIds, completedChapter, "PRACTICE",
                        "Your quiz score was " + roundedPercentage
                                + "%. Review this topic and practise its related concepts.",
                        "Review topic");
            } else {
                nextUncompletedChapter(completedChapter, completedChapterIds, recommendedTopicIds)
                        .ifPresent(chapter -> add(recommendations, recommendedTopicIds, chapter, "NEXT_TOPIC",
                                "You scored " + roundedPercentage
                                        + "%. Continue with the next uncompleted topic in this subject.",
                                "Explore topic"));
            }
        }

        if (quizHistory.isEmpty() && studyHistory.isEmpty()
                && recommendations.size() < MAX_RECOMMENDATIONS) {
            starterChapter(selectedClassId)
                    .ifPresent(chapter -> add(recommendations, recommendedTopicIds, chapter, "START",
                            "Start with an available topic in your selected class.",
                            "Start topic"));
        }
        return List.copyOf(recommendations);
    }

    private java.util.Optional<Chapter> nextUncompletedChapter(
            Chapter completedChapter, Set<Long> completedChapterIds, Set<Long> recommendedTopicIds) {
        return chapterRepository.findBySubject_IdOrderByChapterNumber(
                        completedChapter.getSubject().getId()).stream()
                .filter(chapter -> chapter.getChapterNumber() > completedChapter.getChapterNumber())
                .filter(chapter -> !completedChapterIds.contains(chapter.getId()))
                .filter(chapter -> !recommendedTopicIds.contains(chapter.getId()))
                .findFirst();
    }

    private java.util.Optional<Chapter> starterChapter(Integer selectedClassId) {
        List<Integer> gradeLevels;
        if (selectedClassId != null) {
            if (schoolClassRepository.findByGradeLevel(selectedClassId).isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selected class was not found");
            }
            gradeLevels = List.of(selectedClassId);
        } else {
            gradeLevels = schoolClassRepository.findAll().stream()
                    .map(schoolClass -> schoolClass.getGradeLevel())
                    .sorted()
                    .toList();
        }

        for (Integer gradeLevel : gradeLevels) {
            List<Subject> subjects = subjectRepository.findBySchoolClass_GradeLevel(gradeLevel).stream()
                    .sorted(Comparator.comparing(Subject::getName, String.CASE_INSENSITIVE_ORDER))
                    .toList();
            for (Subject subject : subjects) {
                List<Chapter> chapters = chapterRepository.findBySubject_IdOrderByChapterNumber(subject.getId());
                if (!chapters.isEmpty()) {
                    return java.util.Optional.of(chapters.get(0));
                }
            }
        }
        return java.util.Optional.empty();
    }

    private void add(List<TopicRecommendationResponse> recommendations, Set<Long> recommendedTopicIds,
                     Chapter chapter, String type, String reason, String actionLabel) {
        if (recommendations.size() >= MAX_RECOMMENDATIONS
                || !recommendedTopicIds.add(chapter.getId())) {
            return;
        }
        Subject subject = chapter.getSubject();
        String destination = "/classes/" + subject.getSchoolClass().getGradeLevel()
                + "/" + subject.getId() + "/" + chapter.getId();
        recommendations.add(new TopicRecommendationResponse(
                chapter.getId(), chapter.getTitle(), type, reason, destination, actionLabel));
    }
}
