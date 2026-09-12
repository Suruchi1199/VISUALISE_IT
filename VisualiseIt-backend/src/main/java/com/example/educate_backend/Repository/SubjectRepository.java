package com.example.educate_backend.Repository;

import com.example.educate_backend.model.SchoolClass;
import com.example.educate_backend.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    List<Subject> findBySchoolClass_GradeLevel(Integer gradeLevel);
    boolean existsByNameAndSchoolClass(String name, SchoolClass schoolClass);
    Optional<Subject> findByNameAndSchoolClass(String name, SchoolClass schoolClass);
}
