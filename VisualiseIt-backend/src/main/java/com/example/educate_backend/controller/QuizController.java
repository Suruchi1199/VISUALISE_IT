package com.example.educate_backend.controller;

import com.example.educate_backend.dto.QuizResponse;
import com.example.educate_backend.dto.QuizResultResponse;
import com.example.educate_backend.dto.QuizSubmissionRequest;
import com.example.educate_backend.service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class QuizController {
    private final QuizService quizService;

    @GetMapping("/api/chapters/{chapterId}/quiz")
    public QuizResponse getQuiz(@PathVariable Long chapterId) {
        return quizService.getQuiz(chapterId);
    }

    @PostMapping("/api/chapters/{chapterId}/quiz/submit")
    @ResponseStatus(HttpStatus.OK)
    public QuizResultResponse submitQuiz(@PathVariable Long chapterId, @RequestBody QuizSubmissionRequest request,
                                         Authentication authentication) {
        return quizService.submit(chapterId, authentication.getName(), request);
    }
}
