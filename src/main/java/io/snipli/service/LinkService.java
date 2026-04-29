package io.snipli.service;

import io.snipli.config.SnipliProperties;
import io.snipli.dto.CreateLinkRequest;
import io.snipli.dto.CreateLinkResponse;
import io.snipli.dto.LinkStatsResponse;
import io.snipli.exception.*;
import io.snipli.model.Link;
import io.snipli.repository.LinkRepository;
import io.snipli.util.ShortCodeGenerator;
import org.springframework.stereotype.Service;

import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.Instant;
import java.util.Optional;

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
     * Create a shortened link.
     */
    public CreateLinkResponse shorten(CreateLinkRequest request) {
        validateUrl(request.url());

        String code;
        if (request.alias() != null && !request.alias().isBlank()) {
            code = request.alias();
            if (linkRepository.exists(code)) {
                throw new CodeConflictException("Alias '" + code + "' is already taken");
            }
        } else {
            code = generateUniqueCode();
        }

        Instant now = Instant.now();
        Link link = new Link(code, request.url(), 0, now, request.expiresAt(), null);
        linkRepository.save(link);

        return new CreateLinkResponse(
                code,
                properties.getBaseUrl() + "/" + code,
                request.url(),
                request.expiresAt(),
                now
        );
    }

    /**
     * Resolve a short code to the original URL for redirect.
     * Returns the original URL string.
     */
    public String resolve(String code) {
        // 1. Check cache
        Optional<String> cached = cacheService.get(code);
        if (cached.isPresent()) {
            // Fire-and-forget click task
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
     * Record a click (called by the Cloud Tasks handler).
     */
    public void recordClick(String shortCode, Instant clickedAt) {
        linkRepository.recordClick(shortCode, clickedAt);
    }

    private void validateUrl(String url) {
        try {
            URI uri = new URI(url);
            uri.toURL(); // validates it is a valid URL
            String scheme = uri.getScheme();
            if (scheme == null || (!scheme.equalsIgnoreCase("http") && !scheme.equalsIgnoreCase("https"))) {
                throw new UrlValidationException("URL must use HTTP or HTTPS scheme");
            }
        } catch (URISyntaxException | MalformedURLException e) {
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
