package io.snipli.dto;

import io.snipli.model.User;

import java.time.Instant;

public record UserResponse(
        String id,
        String name,
        String email,
        String workspace,
        String apiKey,
        Instant createdAt
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getWorkspace(),
                user.getApiKey(),
                user.getCreatedAt()
        );
    }
}
