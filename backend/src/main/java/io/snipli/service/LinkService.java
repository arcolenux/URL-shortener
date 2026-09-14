package io.snipli.service;

import io.snipli.config.SnipliProperties;
import io.snipli.dto.*;
import io.snipli.exception.*;
import io.snipli.model.Link;
import io.snipli.repository.LinkRepository;
import io.snipli.util.ShortCodeGenerator;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class LinkService {

    private static final int MAX_RETRIES = 3;

    private final LinkRepository linkRepository;
    private final CacheService cacheService;
    private final ClickTaskService clickTaskService;
    private final SnipliProperties properties;

    public LinkService(LinkRepository linkRepository,
                       CacheService cacheService,
                       ClickTaskService clickTaskService,
                       SnipliProperties properties) {
        this.linkRepository = linkRepository;
        this.cacheService = cacheService;
        this.clickTaskService = clickTaskService;
        this.properties = properties;
    }

    /**
     * Create a shortened link with optional user ownership.
     */
    public CreateLinkResponse shorten(CreateLinkRequest request, String userId) {
        validateUrl(request.url());

        String code;
        if (request.alias() != null && !request.alias().isBlank()) {
            code = request.alias().trim();
            if (linkRepository.exists(code)) {
                throw new CodeConflictException("Alias '" + code + "' is already taken");
            }
        } else {
            code = generateUniqueCode();
        }

        Instant now = Instant.now();
        Link link = new Link(code, request.url().trim(), 0, now, request.expiresAt(), null, userId);
        linkRepository.save(link);

        return new CreateLinkResponse(
                code,
                properties.getBaseUrl() + "/" + code,
                request.url().trim(),
                request.expiresAt(),
                now
        );
    }

    public CreateLinkResponse shorten(CreateLinkRequest request) {
        return shorten(request, null);
    }

    /**
     * Resolve a short code to the original URL for redirect.
     */
    public String resolve(String code) {
        // 1. Check cache
        Optional<String> cached = cacheService.get(code);
        if (cached.isPresent()) {
            clickTaskService.enqueueClick(code);
            return cached.get();
        }

        // 2. Check Firestore
        Link link = linkRepository.findByShortCode(code)
                .orElseThrow(() -> new LinkNotFoundException("No link found for code: " + code));

        if (link.isExpired()) {
            throw new LinkExpiredException("Link '" + code + "' has expired");
        }

        // 3. Cache the result
        cacheService.put(code, link.originalUrl(), link.expiresAt());

        // 4. Enqueue click
        clickTaskService.enqueueClick(code);

        return link.originalUrl();
    }

    /**
     * Retrieve stats for a short code.
     */
    public LinkStatsResponse getStats(String code) {
        Link link = linkRepository.findByShortCode(code)
                .orElseThrow(() -> new LinkNotFoundException("No link found for code: " + code));

        return new LinkStatsResponse(
                link.shortCode(),
                link.originalUrl(),
                link.totalClicks(),
                link.createdAt(),
                link.expiresAt(),
                link.lastClickedAt()
        );
    }

    /**
     * Retrieve single link full details.
     */
    public LinkResponse getLink(String code) {
        Link link = linkRepository.findByShortCode(code)
                .orElseThrow(() -> new LinkNotFoundException("No link found for code: " + code));
        return toLinkResponse(link);
    }

    /**
     * List links with search, status filtering, and pagination, scoped to user.
     */
    public PaginatedLinksResponse listLinks(String search, String status, int page, int size, String userId) {
        List<Link> allLinks = (userId != null && !userId.isBlank())
                ? linkRepository.findByUserId(userId)
                : linkRepository.findAll();

        // Apply filters
        List<Link> filtered = allLinks.stream()
                .filter(l -> {
                    if (search != null && !search.isBlank()) {
                        String s = search.trim().toLowerCase();
                        boolean matchCode = l.shortCode().toLowerCase().contains(s);
                        boolean matchUrl = l.originalUrl().toLowerCase().contains(s);
                        if (!matchCode && !matchUrl) return false;
                    }
                    if (status != null && !status.isBlank() && !status.equalsIgnoreCase("all")) {
                        if (!l.getStatus().equalsIgnoreCase(status)) return false;
                    }
                    return true;
                })
                .sorted(Comparator.comparing(Link::createdAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());

        int totalElements = filtered.size();
        int safePage = Math.max(0, page);
        int safeSize = size > 0 ? size : 10;
        int totalPages = (int) Math.ceil((double) totalElements / safeSize);

        int fromIndex = Math.min(safePage * safeSize, totalElements);
        int toIndex = Math.min(fromIndex + safeSize, totalElements);

        List<LinkResponse> pageLinks = filtered.subList(fromIndex, toIndex).stream()
                .map(this::toLinkResponse)
                .collect(Collectors.toList());

        return new PaginatedLinksResponse(pageLinks, safePage, safeSize, totalElements, totalPages);
    }

    public PaginatedLinksResponse listLinks(String search, String status, int page, int size) {
        return listLinks(search, status, page, size, null);
    }

    /**
     * Aggregate dashboard summary metrics and time-series click traffic scoped to user.
     */
    public DashboardResponse getDashboardSummary(String userId) {
        List<Link> allLinks = (userId != null && !userId.isBlank())
                ? linkRepository.findByUserId(userId)
                : linkRepository.findAll();

        long totalLinks = allLinks.size();
        long totalClicks = allLinks.stream().mapToLong(Link::totalClicks).sum();
        long activeLinks = allLinks.stream().filter(l -> !l.isExpired()).count();
        long expiringSoonLinks = allLinks.stream().filter(Link::isExpiringSoon).count();

        List<LinkResponse> recentLinks = allLinks.stream()
                .sorted(Comparator.comparing(Link::createdAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(5)
                .map(this::toLinkResponse)
                .collect(Collectors.toList());

        List<DashboardResponse.DailyClickPoint> trafficPoints = new ArrayList<>();
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd");

        for (int i = 6; i >= 0; i--) {
            LocalDate day = today.minusDays(i);
            String dateLabel = day.format(formatter);
            long dayClicks = allLinks.stream()
                    .filter(l -> l.lastClickedAt() != null && l.lastClickedAt().atZone(ZoneOffset.UTC).toLocalDate().equals(day))
                    .mapToLong(Link::totalClicks)
                    .sum();
            if (dayClicks == 0 && totalClicks > 0 && i == 0) {
                dayClicks = totalClicks;
            }
            trafficPoints.add(new DashboardResponse.DailyClickPoint(dateLabel, dayClicks));
        }

        return new DashboardResponse(totalLinks, totalClicks, activeLinks, expiringSoonLinks, recentLinks, trafficPoints);
    }

    public DashboardResponse getDashboardSummary() {
        return getDashboardSummary(null);
    }

    /**
     * Update an existing link's destination URL and expiration.
     */
    public LinkResponse updateLink(String code, UpdateLinkRequest request, String userId) {
        validateUrl(request.url());

        Link link = linkRepository.findByShortCode(code)
                .orElseThrow(() -> new LinkNotFoundException("No link found for code: " + code));

        // Ownership verification
        if (userId != null && link.userId() != null && !userId.equals(link.userId())) {
            throw new AuthException("FORBIDDEN", "You do not have permission to modify this link", HttpStatus.FORBIDDEN);
        }

        Link updated = new Link(
                link.shortCode(),
                request.url().trim(),
                link.totalClicks(),
                link.createdAt(),
                request.expiresAt(),
                link.lastClickedAt(),
                link.userId()
        );

        linkRepository.save(updated);
        cacheService.evict(code);

        return toLinkResponse(updated);
    }

    /**
     * Delete a link and evict from cache with ownership check.
     */
    public void deleteLink(String code, String userId) {
        Link link = linkRepository.findByShortCode(code)
                .orElseThrow(() -> new LinkNotFoundException("No link found for code: " + code));

        // Ownership verification
        if (userId != null && link.userId() != null && !userId.equals(link.userId())) {
            throw new AuthException("FORBIDDEN", "You do not have permission to delete this link", HttpStatus.FORBIDDEN);
        }

        cacheService.evict(code);
        boolean deleted = linkRepository.delete(code);
        if (!deleted) {
            throw new LinkNotFoundException("No link found for code: " + code);
        }
    }

    public void deleteLink(String code) {
        deleteLink(code, null);
    }

    /**
     * Record a click (called by the Cloud Tasks handler).
     */
    public void recordClick(String shortCode, Instant clickedAt) {
        linkRepository.recordClick(shortCode, clickedAt);
    }

    private LinkResponse toLinkResponse(Link link) {
        return new LinkResponse(
                link.shortCode(),
                properties.getBaseUrl() + "/" + link.shortCode(),
                link.originalUrl(),
                link.totalClicks(),
                link.createdAt(),
                link.expiresAt(),
                link.lastClickedAt(),
                link.getStatus()
        );
    }

    private void validateUrl(String url) {
        if (url == null || url.isBlank()) {
            throw new UrlValidationException("URL must not be blank");
        }
        try {
            URI uri = new URI(url.trim());
            if (!uri.isAbsolute()) {
                throw new UrlValidationException("URL must be absolute (include scheme)");
            }
            uri.toURL(); // validates syntax
            String scheme = uri.getScheme();
            if (scheme == null || (!scheme.equalsIgnoreCase("http") && !scheme.equalsIgnoreCase("https"))) {
                throw new UrlValidationException("URL must use HTTP or HTTPS scheme");
            }
        } catch (URISyntaxException | MalformedURLException | IllegalArgumentException e) {
            throw new UrlValidationException("Invalid URL: " + e.getMessage());
        }
    }

    private String generateUniqueCode() {
        for (int attempt = 0; attempt < MAX_RETRIES; attempt++) {
            String code = ShortCodeGenerator.generate();
            if (!linkRepository.exists(code)) {
                return code;
            }
        }
        throw new CodeGenerationException("Failed to generate a unique short code after " + MAX_RETRIES + " attempts");
    }
}
