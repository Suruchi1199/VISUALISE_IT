package com.example.educate_backend.Repository;

import com.example.educate_backend.model.Chapter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChapterRepository extends JpaRepository<Chapter, Long> {
    List<Chapter> findBySubject_IdOrderByChapterNumber(Long subjectId);
    boolean existsBySubject_IdAndChapterNumber(Long subjectId, Integer chapterNumber);
}
