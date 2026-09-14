package io.snipli.service;

import io.snipli.config.SnipliProperties;
import io.snipli.dto.*;
import io.snipli.exception.*;
import io.snipli.model.Link;
import io.snipli.repository.LinkRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LinkServiceTest {

    @Mock
    private LinkRepository linkRepository;
    @Mock
    private CacheService cacheService;
    @Mock
    private ClickTaskService clickTaskService;

    private SnipliProperties properties;
    private LinkService linkService;

    @BeforeEach
    void setUp() {
        properties = new SnipliProperties();
        properties.setBaseUrl("https://snipli.io");
        linkService = new LinkService(linkRepository, cacheService, clickTaskService, properties);
    }

    @Nested
    class Shorten {

        @Test
        void happyPath_generatesCodeAndReturns201() {
            when(linkRepository.exists(anyString())).thenReturn(false);

            CreateLinkRequest request = new CreateLinkRequest(
                    "https://example.com/long/url", null, null);

            CreateLinkResponse response = linkService.shorten(request);

            assertNotNull(response.shortCode());
            assertEquals("https://example.com/long/url", response.originalUrl());
            assertTrue(response.shortUrl().startsWith("https://snipli.io/"));
            verify(linkRepository).save(any(Link.class));
        }

        @Test
        void customAlias_usesProvidedAlias() {
            when(linkRepository.exists("my-alias")).thenReturn(false);

            CreateLinkRequest request = new CreateLinkRequest(
                    "https://example.com", "my-alias", null);

            CreateLinkResponse response = linkService.shorten(request);

            assertEquals("my-alias", response.shortCode());
            assertEquals("https://snipli.io/my-alias", response.shortUrl());
        }

        @Test
        void customAlias_conflict_throws409() {
            when(linkRepository.exists("taken")).thenReturn(true);

            CreateLinkRequest request = new CreateLinkRequest(
                    "https://example.com", "taken", null);

            assertThrows(CodeConflictException.class, () -> linkService.shorten(request));
        }

        @Test
        void invalidUrl_throws400() {
            CreateLinkRequest request = new CreateLinkRequest(
                    "not-a-valid-url", null, null);

            assertThrows(UrlValidationException.class, () -> linkService.shorten(request));
        }

        @Test
        void ftpUrl_throws400() {
            CreateLinkRequest request = new CreateLinkRequest(
                    "ftp://files.example.com/doc.pdf", null, null);

            assertThrows(UrlValidationException.class, () -> linkService.shorten(request));
        }
    }

    @Nested
    class Resolve {

        @Test
        void cacheHit_returnsUrlFromCache() {
            when(cacheService.get("abc1234")).thenReturn(Optional.of("https://example.com"));

            String url = linkService.resolve("abc1234");

            assertEquals("https://example.com", url);
            verify(linkRepository, never()).findByShortCode(anyString());
            verify(clickTaskService).enqueueClick("abc1234");
        }

        @Test
        void cacheMiss_fetchesFromFirestoreAndCaches() {
            when(cacheService.get("abc1234")).thenReturn(Optional.empty());
            Link link = new Link("abc1234", "https://example.com", 5,
                    Instant.now(), null, null);
            when(linkRepository.findByShortCode("abc1234")).thenReturn(Optional.of(link));

            String url = linkService.resolve("abc1234");

            assertEquals("https://example.com", url);
            verify(cacheService).put(eq("abc1234"), eq("https://example.com"), isNull());
            verify(clickTaskService).enqueueClick("abc1234");
        }

        @Test
        void expiredLink_throws410() {
            when(cacheService.get("expired")).thenReturn(Optional.empty());
            Link link = new Link("expired", "https://example.com", 0,
                    Instant.now().minus(2, ChronoUnit.DAYS),
                    Instant.now().minus(1, ChronoUnit.DAYS), null);
            when(linkRepository.findByShortCode("expired")).thenReturn(Optional.of(link));

            assertThrows(LinkExpiredException.class, () -> linkService.resolve("expired"));
        }

        @Test
        void notFound_throws404() {
            when(cacheService.get("missing")).thenReturn(Optional.empty());
            when(linkRepository.findByShortCode("missing")).thenReturn(Optional.empty());

            assertThrows(LinkNotFoundException.class, () -> linkService.resolve("missing"));
        }
    }

    @Nested
    class Stats {

        @Test
        void returnsStatsForExistingLink() {
            Instant now = Instant.now();
            Link link = new Link("abc1234", "https://example.com", 42, now, null, now);
            when(linkRepository.findByShortCode("abc1234")).thenReturn(Optional.of(link));

            LinkStatsResponse stats = linkService.getStats("abc1234");

            assertEquals("abc1234", stats.shortCode());
            assertEquals(42, stats.totalClicks());
            assertEquals("https://example.com", stats.originalUrl());
        }

        @Test
        void notFound_throws404() {
            when(linkRepository.findByShortCode("missing")).thenReturn(Optional.empty());
            assertThrows(LinkNotFoundException.class, () -> linkService.getStats("missing"));
        }
    }

    @Nested
    class DashboardAndManagement {

        @Test
        void listLinks_filtersAndPaginates() {
            Instant now = Instant.now();
            Link link1 = new Link("abc", "https://example.com/one", 10, now, null, null);
            Link link2 = new Link("xyz", "https://other.org/two", 5, now.minusSeconds(100), null, null);
            when(linkRepository.findAll()).thenReturn(List.of(link1, link2));

            PaginatedLinksResponse res = linkService.listLinks("example", "active", 0, 10);
            assertEquals(1, res.totalElements());
            assertEquals("abc", res.links().get(0).shortCode());
        }

        @Test
        void getDashboardSummary_aggregatesCorrectly() {
            Instant now = Instant.now();
            Link link1 = new Link("abc", "https://example.com/one", 10, now, null, now);
            Link link2 = new Link("xyz", "https://other.org/two", 5, now.minusSeconds(100), null, now);
            when(linkRepository.findAll()).thenReturn(List.of(link1, link2));

            DashboardResponse dashboard = linkService.getDashboardSummary();
            assertEquals(2, dashboard.totalLinks());
            assertEquals(15, dashboard.totalClicks());
            assertEquals(2, dashboard.activeLinks());
            assertEquals(0, dashboard.expiringSoonLinks());
            assertEquals(2, dashboard.recentLinks().size());
            assertEquals(7, dashboard.clickTraffic().size());
        }

        @Test
        void deleteLink_callsRepoAndCache() {
            Link link = new Link("abc", "https://example.com", 0, Instant.now(), null, null);
            when(linkRepository.findByShortCode("abc")).thenReturn(Optional.of(link));
            when(linkRepository.delete("abc")).thenReturn(true);
            linkService.deleteLink("abc");
            verify(cacheService).evict("abc");
            verify(linkRepository).delete("abc");
        }
    }
}
