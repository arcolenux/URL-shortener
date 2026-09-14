package io.snipli.dto;

import java.util.List;

public record DashboardResponse(
        long totalLinks,
        long totalClicks,
        long activeLinks,
        long expiringSoonLinks,
        List<LinkResponse> recentLinks,
        List<DailyClickPoint> clickTraffic
) {
    public record DailyClickPoint(String date, long clicks) {}
}
