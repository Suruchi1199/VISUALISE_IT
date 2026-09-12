package com.example.educate_backend.Repository;

import com.example.educate_backend.model.SchoolClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for SchoolClass entities.
 */
@Repository
public interface SchoolClassRepository extends JpaRepository<SchoolClass, Long> {
    boolean existsByGradeLevel(Integer gradeLevel);
    Optional<SchoolClass> findByGradeLevel(Integer gradeLevel);
}
