package com.example.educate_backend.dto;

public record TopicRecommendationResponse(Long topicId, String title, String type,
                                          String reason, String destination, String actionLabel) {}
