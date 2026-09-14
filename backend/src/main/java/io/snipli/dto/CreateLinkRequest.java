package io.snipli.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public record CreateLinkRequest(
        @JsonAlias({"originalUrl", "url"})
        @NotBlank(message = "URL must not be blank")
        String url,

        @JsonAlias({"customAlias", "alias"})
        @Size(max = 30, message = "Alias must be at most 30 characters")
        @Pattern(regexp = "^[a-zA-Z0-9_-]*$", message = "Alias may only contain alphanumeric characters, hyphens, and underscores")
        String alias,

        @JsonFormat(shape = JsonFormat.Shape.STRING)
        Instant expiresAt
) {}
