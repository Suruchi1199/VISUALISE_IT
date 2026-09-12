package com.example.educate_backend.config;

import com.example.educate_backend.service.SubjectService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class SubjectDataInitializer implements ApplicationRunner {

    private final SubjectService subjectService;

    @Override
    public void run(ApplicationArguments args) {
        log.info("Running SubjectDataInitializer");
        subjectService.initializeDefaultSubjects();
    }
}
