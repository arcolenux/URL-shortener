package io.snipli.model;

import java.time.Duration;
import java.time.Instant;

public record Link(
        String shortCode,
        String originalUrl,
        long totalClicks,
        Instant createdAt,
        Instant expiresAt,
        Instant lastClickedAt,
        String userId
) {
    public Link(String shortCode, String originalUrl, long totalClicks, Instant createdAt, Instant expiresAt, Instant lastClickedAt) {
        this(shortCode, originalUrl, totalClicks, createdAt, expiresAt, lastClickedAt, null);
    }

    public boolean isExpired() {
        return expiresAt != null && Instant.now().isAfter(expiresAt);
    }

    public boolean isExpiringSoon() {
        if (expiresAt == null || isExpired()) {
            return false;
        }
        return Instant.now().plus(Duration.ofDays(7)).isAfter(expiresAt);
    }

    public String getStatus() {
        if (isExpired()) {
            return "EXPIRED";
        }
        if (isExpiringSoon()) {
            return "EXPIRING_SOON";
        }
        return "ACTIVE";
    }
}
