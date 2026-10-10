package com.example.educate_backend.dto;

import java.time.LocalDate;
import java.util.List;

public record ActivityCalendarResponse(List<LocalDate> activeDates) {}
