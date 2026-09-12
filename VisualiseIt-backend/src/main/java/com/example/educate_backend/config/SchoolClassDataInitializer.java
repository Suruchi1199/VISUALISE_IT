package com.example.educate_backend.config;

import com.example.educate_backend.service.SchoolClassService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * Initializes default classes on startup.
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class SchoolClassDataInitializer implements ApplicationRunner {

    private final SchoolClassService schoolClassService;

    @Override
    public void run(ApplicationArguments args) {
        log.info("Running SchoolClassDataInitializer");
        schoolClassService.initializeDefaultClasses();
    }
}
