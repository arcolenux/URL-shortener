package io.snipli.dto;

import java.util.List;

public record PaginatedLinksResponse(
        List<LinkResponse> links,
        int page,
        int size,
        long totalElements,
        int totalPages
) {}
