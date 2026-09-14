package io.snipli.dto;

import java.time.Instant;

public record LinkStatsResponse(
        String shortCode,
        String originalUrl,
        long totalClicks,
        Instant createdAt,
        Instant expiresAt,
        Instant lastClickedAt
) {}
