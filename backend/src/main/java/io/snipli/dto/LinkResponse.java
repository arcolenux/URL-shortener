package io.snipli.dto;

import java.time.Instant;

public record LinkResponse(
        String shortCode,
        String shortUrl,
        String originalUrl,
        long totalClicks,
        Instant createdAt,
        Instant expiresAt,
        Instant lastClickedAt,
        String status
) {}
