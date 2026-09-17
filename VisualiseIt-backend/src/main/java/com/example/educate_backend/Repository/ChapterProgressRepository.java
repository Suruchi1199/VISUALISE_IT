package com.example.educate_backend.Repository;

import com.example.educate_backend.model.ChapterProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChapterProgressRepository extends JpaRepository<ChapterProgress, Long> {
    Optional<ChapterProgress> findByUser_IdAndChapter_Id(Long userId, Long chapterId);
    List<ChapterProgress> findByUser_IdOrderByCompletedAtDesc(Long userId);
}
