package io.snipli.model;

import java.time.Instant;

public record Link(
        String shortCode,
        String originalUrl,
        long totalClicks,
        Instant createdAt,
        Instant expiresAt,
        Instant lastClickedAt
) {
    public boolean isExpired() {
        return expiresAt != null && Instant.now().isAfter(expiresAt);
    }
}
