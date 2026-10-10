package com.example.educate_backend.dto;

import java.time.LocalDate;

public record StudyActivityRequest(int seconds, LocalDate date) {}
