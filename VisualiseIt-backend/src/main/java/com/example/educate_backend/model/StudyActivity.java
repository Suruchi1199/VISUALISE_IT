package com.example.educate_backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "study_activity", uniqueConstraints =
        @UniqueConstraint(columnNames = {"user_id", "chapter_id", "activity_date"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudyActivity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "chapter_id", nullable = false)
    private Chapter chapter;

    @Column(name = "activity_date", nullable = false)
    private LocalDate activityDate;

    @Column(name = "seconds_studied", nullable = false)
    private int secondsStudied;

    @Column(name = "last_accessed", nullable = false)
    private LocalDateTime lastAccessed;
}
