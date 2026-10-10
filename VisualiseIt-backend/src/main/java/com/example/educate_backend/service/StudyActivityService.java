package com.example.educate_backend.service;

import com.example.educate_backend.Repository.ChapterRepository;
import com.example.educate_backend.Repository.ChapterProgressRepository;
import com.example.educate_backend.Repository.StudyActivityRepository;
import com.example.educate_backend.Repository.UserRepository;
import com.example.educate_backend.Repository.WebsiteVisitRepository;
import com.example.educate_backend.model.Chapter;
import com.example.educate_backend.model.ChapterProgress;
import com.example.educate_backend.model.StudyActivity;
import com.example.educate_backend.model.User;
import com.example.educate_backend.model.WebsiteVisit;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;

@Service
@RequiredArgsConstructor
public class StudyActivityService {
    private static final int MAX_REPORTED_SECONDS = 120;

    private final StudyActivityRepository activityRepository;
    private final ChapterRepository chapterRepository;
    private final UserRepository userRepository;
    private final WebsiteVisitRepository websiteVisitRepository;
    private final ChapterProgressRepository progressRepository;

    @Transactional
    public void record(String email, Long chapterId, int seconds, LocalDate date) {
        if (seconds < 0 || seconds > MAX_REPORTED_SECONDS) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Study time must be between 0 and 120 seconds");
        }
        validateActivityDate(date);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user was not found"));
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chapter not found"));

        LocalDateTime now = LocalDateTime.now();
        StudyActivity activity = activityRepository
                .findByUser_IdAndChapter_IdAndActivityDate(user.getId(), chapterId, date)
                .orElseGet(() -> new StudyActivity(null, user, chapter, date, 0, now));
        activity.setSecondsStudied(activity.getSecondsStudied() + seconds);
        activity.setLastAccessed(now);
        activityRepository.save(activity);
    }

    @Transactional
    public void recordVisit(String email, LocalDate date) {
        validateActivityDate(date);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user was not found"));
        websiteVisitRepository.findByUser_IdAndVisitDate(user.getId(), date)
                .orElseGet(() -> websiteVisitRepository.save(new WebsiteVisit(null, user, date)));
    }

    @Transactional(readOnly = true)
    public List<LocalDate> getCalendarActivity(String email, YearMonth month, ZoneId timeZone) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user was not found"));

        LocalDate startDate = month.atDay(1);
        LocalDate endDate = month.atEndOfMonth();
        Set<LocalDate> activeDates = new TreeSet<>();
        activityRepository.findByUser_IdAndActivityDateBetween(user.getId(), startDate, endDate)
                .forEach(activity -> activeDates.add(activity.getActivityDate()));
        websiteVisitRepository.findByUser_IdAndVisitDateBetween(user.getId(), startDate, endDate)
                .forEach(visit -> activeDates.add(visit.getVisitDate()));

        ZoneId serverTimeZone = ZoneId.systemDefault();
        LocalDateTime startTime = startDate.atStartOfDay(timeZone)
                .withZoneSameInstant(serverTimeZone).toLocalDateTime();
        LocalDateTime endTime = month.plusMonths(1).atDay(1).atStartOfDay(timeZone)
                .withZoneSameInstant(serverTimeZone).toLocalDateTime();
        List<ChapterProgress> quizCompletions = progressRepository
                .findByUser_IdAndCompletedAtGreaterThanEqualAndCompletedAtLessThan(
                        user.getId(), startTime, endTime);
        quizCompletions.stream()
                .map(progress -> progress.getCompletedAt().atZone(serverTimeZone)
                        .withZoneSameInstant(timeZone).toLocalDate())
                .filter(date -> YearMonth.from(date).equals(month))
                .forEach(activeDates::add);

        return List.copyOf(activeDates);
    }

    private void validateActivityDate(LocalDate date) {
        if (date == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Activity date is required");
        }
        LocalDate utcToday = LocalDate.now(ZoneOffset.UTC);
        if (date.isBefore(utcToday.minusDays(1)) || date.isAfter(utcToday.plusDays(1))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Activity date is outside the allowed range");
        }
    }
}
