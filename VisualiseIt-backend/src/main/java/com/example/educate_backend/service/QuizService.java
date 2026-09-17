package com.example.educate_backend.service;

import com.example.educate_backend.Repository.ChapterProgressRepository;
import com.example.educate_backend.Repository.ChapterRepository;
import com.example.educate_backend.Repository.UserRepository;
import com.example.educate_backend.dto.*;
import com.example.educate_backend.model.Chapter;
import com.example.educate_backend.model.ChapterProgress;
import com.example.educate_backend.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class QuizService {
    private static final int BASE_XP = 20;
    private final ChapterRepository chapterRepository;
    private final ChapterProgressRepository progressRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public QuizResponse getQuiz(Long chapterId) {
        Chapter chapter = getCoordinateChapter(chapterId);
        return new QuizResponse(chapter.getId(), chapter.getTitle(), questions().entrySet().stream()
                .map(entry -> new QuizQuestionResponse(entry.getKey(), entry.getValue().question(), entry.getValue().options()))
                .toList());
    }

    @Transactional
    public QuizResultResponse submit(Long chapterId, String email, QuizSubmissionRequest request) {
        Chapter chapter = getCoordinateChapter(chapterId);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user was not found"));

        var existing = progressRepository.findByUser_IdAndChapter_Id(user.getId(), chapterId);
        if (existing.isPresent()) {
            return toResult(existing.get(), totalXp(user.getId()), true);
        }

        Map<String, String> answers = request == null || request.answers() == null ? Map.of() : request.answers();
        Map<String, Question> questions = questions();
        int score = (int) questions.entrySet().stream()
                .filter(entry -> entry.getValue().answer().equals(answers.get(entry.getKey())))
                .count();
        int total = questions.size();
        int xp = BASE_XP + (score * 10) + (score == total ? 20 : 0);

        ChapterProgress progress = new ChapterProgress(null, user, chapter, true, score, total, xp, LocalDateTime.now());
        progressRepository.save(progress);
        return toResult(progress, totalXp(user.getId()), false);
    }

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user was not found"));
        List<ChapterProgress> progress = progressRepository.findByUser_IdOrderByCompletedAtDesc(user.getId());
        int totalXp = progress.stream().mapToInt(ChapterProgress::getXpEarned).sum();
        int average = progress.isEmpty() ? 0 : (int) Math.round(progress.stream()
                .mapToDouble(item -> item.getScore() * 100.0 / item.getTotalQuestions()).average().orElse(0));
        List<DashboardResponse.CompletedChapterResponse> recent = progress.stream().limit(5)
                .map(item -> new DashboardResponse.CompletedChapterResponse(item.getChapter().getId(),
                        item.getChapter().getTitle(), item.getScore(), item.getTotalQuestions(), item.getXpEarned()))
                .toList();
        return new DashboardResponse(totalXp, progress.size(), progress.size(), average, recent);
    }

    private int totalXp(Long userId) {
        return progressRepository.findByUser_IdOrderByCompletedAtDesc(userId).stream()
                .mapToInt(ChapterProgress::getXpEarned).sum();
    }

    private QuizResultResponse toResult(ChapterProgress progress, int totalXp, boolean alreadyCompleted) {
        int percentage = (int) Math.round(progress.getScore() * 100.0 / progress.getTotalQuestions());
        return new QuizResultResponse(progress.getScore(), progress.getTotalQuestions(), percentage,
                percentage >= 50, progress.getXpEarned(), totalXp, progress.isCompleted(), alreadyCompleted);
    }

    private Chapter getCoordinateChapter(Long chapterId) {
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chapter not found"));
        if (chapter.getSubject().getSchoolClass().getGradeLevel() != 9
                || !"Mathematics".equalsIgnoreCase(chapter.getSubject().getName())
                || chapter.getChapterNumber() != 1) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "A quiz is not available for this chapter");
        }
        return chapter;
    }

    private Map<String, Question> questions() {
        Map<String, Question> quiz = new LinkedHashMap<>();
        quiz.put("q1", new Question("What is the point where the x-axis and y-axis meet?",
                List.of("Origin", "Quadrant", "Coordinate", "Distance"), "Origin"));
        quiz.put("q2", new Question("Which coordinates describe a point on the y-axis?",
                List.of("(x, 0)", "(0, y)", "(x, y)", "(1, 1)"), "(0, y)"));
        quiz.put("q3", new Question("In which quadrant is the point (−3, 4)?",
                List.of("Quadrant I", "Quadrant II", "Quadrant III", "Quadrant IV"), "Quadrant II"));
        quiz.put("q4", new Question("What is the distance between (0, 0) and (3, 4)?",
                List.of("4 units", "5 units", "6 units", "7 units"), "5 units"));
        quiz.put("q5", new Question("What is the x-coordinate of every point on the y-axis?",
                List.of("0", "1", "−1", "It changes with y"), "0"));
        return quiz;
    }

    private record Question(String question, List<String> options, String answer) {}
}
