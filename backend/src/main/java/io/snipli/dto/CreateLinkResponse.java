package io.snipli.dto;

import java.time.Instant;

public record CreateLinkResponse(
        String shortCode,
        String shortUrl,
        String originalUrl,
        Instant expiresAt,
        Instant createdAt
) {}
