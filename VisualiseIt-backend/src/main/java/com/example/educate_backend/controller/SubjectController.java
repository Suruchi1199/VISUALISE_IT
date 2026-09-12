package com.example.educate_backend.controller;

import com.example.educate_backend.dto.ChapterResponse;
import com.example.educate_backend.dto.SubjectResponse;
import com.example.educate_backend.service.SubjectService;
import com.example.educate_backend.service.ChapterSectionService;
import com.example.educate_backend.dto.ChapterSectionResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@Slf4j
public class SubjectController {

    @Autowired
    private SubjectService subjectService;

    @Autowired
    private ChapterSectionService chapterSectionService;

    @GetMapping("/api/classes/{classLevel}/subjects")
    public ResponseEntity<List<SubjectResponse>> getSubjectsForClass(@PathVariable Integer classLevel) {
        log.info("GET /api/classes/{}/subjects called", classLevel);
        List<SubjectResponse> subjects = subjectService.getSubjectsByClassLevel(classLevel);
        return new ResponseEntity<>(subjects, HttpStatus.OK);
    }

    @GetMapping("/api/classes/subjects/{subjectId}")
    public ResponseEntity<SubjectResponse> getSubjectById(@PathVariable Long subjectId) {
        log.info("GET /api/classes/subjects/{} called", subjectId);
        SubjectResponse subject = subjectService.getSubjectById(subjectId);
        if (subject == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(subject, HttpStatus.OK);
    }

    @GetMapping("/api/subjects/{subjectId}/chapters")
    public ResponseEntity<List<ChapterResponse>> getChaptersBySubject(@PathVariable Long subjectId) {
        log.info("GET /api/subjects/{}/chapters called", subjectId);
        List<ChapterResponse> chapters = subjectService.getChaptersBySubjectId(subjectId);
        if (chapters == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(chapters, HttpStatus.OK);
    }

    @GetMapping("/api/chapters/{chapterId}/sections")
    public ResponseEntity<List<ChapterSectionResponse>> getChapterSections(@PathVariable Long chapterId) {
        return new ResponseEntity<>(chapterSectionService.getSections(chapterId), HttpStatus.OK);
    }
}
