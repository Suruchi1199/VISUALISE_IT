package com.example.educate_backend.Repository;

import com.example.educate_backend.model.WebsiteVisit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface WebsiteVisitRepository extends JpaRepository<WebsiteVisit, Long> {
    Optional<WebsiteVisit> findByUser_IdAndVisitDate(Long userId, LocalDate visitDate);

    List<WebsiteVisit> findByUser_IdAndVisitDateBetween(Long userId, LocalDate start, LocalDate end);
}
