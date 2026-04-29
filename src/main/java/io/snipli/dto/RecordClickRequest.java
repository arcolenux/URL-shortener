package io.snipli.dto;

import java.time.Instant;

public record RecordClickRequest(
        String shortCode,
        Instant clickedAt
) {}
