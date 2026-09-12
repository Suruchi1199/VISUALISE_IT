package com.example.educate_backend.service;

import com.example.educate_backend.Repository.ChapterRepository;
import com.example.educate_backend.dto.ChapterSectionResponse;
import com.example.educate_backend.model.Chapter;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ChapterSectionService {

    private final ChapterRepository chapterRepository;
    private final ObjectMapper objectMapper;

    public List<ChapterSectionResponse> getSections(Long chapterId) {
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new IllegalArgumentException("Chapter not found with id: " + chapterId));

        // Build a resource filename based on class level, subject name and chapter number
        Integer gradeLevel = null;
        try {
            gradeLevel = chapter.getSubject().getSchoolClass().getGradeLevel();
        } catch (Exception ignored) {
        }

        String subjectName = "";
        try {
            subjectName = chapter.getSubject().getName();
        } catch (Exception ignored) {
        }

        String subjectSlug = subjectName == null ? "" : subjectName.toLowerCase(Locale.ROOT).replaceAll("\\s+", "-");
        String filename = null;

        if (gradeLevel != null && !subjectSlug.isEmpty() && chapter.getChapterNumber() != null) {
            filename = String.format("content/class%d-%s-chapter%d.json", gradeLevel, subjectSlug, chapter.getChapterNumber());
        }

        // Fallback to a generic class9-mathematics-chapter1.json if the dynamic filename is not available
        String fallback = "content/class9-mathematics-chapter1.json";

        List<ChapterSectionResponse> sections;

        try (InputStream input = loadResourceStream(filename, fallback)) {
            sections = objectMapper.readValue(input, new TypeReference<List<ChapterSectionResponse>>() {});
        } catch (IOException exception) {
            throw new IllegalStateException("Unable to load chapter content from resources", exception);
        }

        return sections;
    }

    private InputStream loadResourceStream(String filename, String fallback) throws IOException {
        if (filename != null) {
            ClassPathResource res = new ClassPathResource(filename);
            if (res.exists()) {
                return res.getInputStream();
            }
        }
        ClassPathResource fallbackRes = new ClassPathResource(fallback);
        if (fallbackRes.exists()) {
            return fallbackRes.getInputStream();
        }
        throw new IOException("Neither " + filename + " nor " + fallback + " could be found on the classpath");
    }
}
