package com.example.educate_backend.Repository;

import com.example.educate_backend.model.StudyActivity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface StudyActivityRepository extends JpaRepository<StudyActivity, Long> {
    Optional<StudyActivity> findByUser_IdAndChapter_IdAndActivityDate(
            Long userId, Long chapterId, LocalDate activityDate);

    List<StudyActivity> findByUser_IdAndActivityDateBetween(Long userId, LocalDate start, LocalDate end);

    List<StudyActivity> findByUser_IdOrderByLastAccessedDesc(Long userId);
}
