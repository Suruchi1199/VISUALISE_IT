package com.example.educate_backend.controller;

import com.example.educate_backend.Repository.ChapterRepository;
import com.example.educate_backend.Repository.SchoolClassRepository;
import com.example.educate_backend.Repository.SubjectRepository;
import com.example.educate_backend.model.Chapter;
import com.example.educate_backend.model.SchoolClass;
import com.example.educate_backend.model.Subject;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/public")
@Slf4j
@RequiredArgsConstructor
public class PublicController {

    private final SchoolClassRepository schoolClassRepository;
    private final SubjectRepository subjectRepository;
    private final ChapterRepository chapterRepository;

    /**
     * Find the chapter id for a given class level, subject name and chapter number.
     * Example: GET /api/public/class/9/subject/Mathematics/chapter/1/id
     */
    @GetMapping("/class/{classLevel}/subject/{subjectName}/chapter/{chapterNumber}/id")
    public ResponseEntity<?> getChapterId(@PathVariable Integer classLevel,
                                          @PathVariable String subjectName,
                                          @PathVariable Integer chapterNumber) {
        log.info("Resolving chapter id for class {}, subject {}, chapter {}", classLevel, subjectName, chapterNumber);

        Optional<SchoolClass> sc = schoolClassRepository.findByGradeLevel(classLevel);
        if (sc.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Class not found");

        Optional<Subject> subj = subjectRepository.findByNameAndSchoolClass(subjectName, sc.get());
        if (subj.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Subject not found");

        List<Chapter> chapters = chapterRepository.findBySubject_IdOrderByChapterNumber(subj.get().getId());
        for (Chapter c: chapters) {
            if (c.getChapterNumber() != null && c.getChapterNumber().equals(chapterNumber)) {
                return ResponseEntity.ok().body(java.util.Map.of("chapterId", c.getId(), "title", c.getTitle()));
            }
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Chapter not found");
    }
}
