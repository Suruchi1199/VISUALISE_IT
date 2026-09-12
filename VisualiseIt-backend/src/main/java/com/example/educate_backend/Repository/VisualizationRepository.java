package com.example.educate_backend.Repository;

import com.example.educate_backend.model.Visualization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VisualizationRepository extends JpaRepository<Visualization, Long> {
    List<Visualization> findByChapter_IdOrderByIdAsc(Long chapterId);
    boolean existsByChapter_IdAndTitle(Long chapterId, String title);
}
