package com.example.educate_backend.Repository;

import com.example.educate_backend.model.UserSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * UserSettings Repository.
 * Data access interface for UserSettings entity.
 */
@Repository
public interface UserSettingsRepository extends JpaRepository<UserSettings, Long> {
    /**
     * Find user settings by user ID.
     * @param userId the user ID
     * @return Optional containing UserSettings if found
     */
    Optional<UserSettings> findByUserId(Long userId);
}
