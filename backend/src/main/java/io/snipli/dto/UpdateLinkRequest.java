package io.snipli.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;

import java.time.Instant;

public record UpdateLinkRequest(
        @JsonAlias({"originalUrl", "url"})
        @NotBlank(message = "URL must not be blank")
        String url,

        @JsonFormat(shape = JsonFormat.Shape.STRING)
        Instant expiresAt
) {}
