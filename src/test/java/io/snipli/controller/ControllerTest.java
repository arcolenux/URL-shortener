package io.snipli.controller;

import io.snipli.dto.CreateLinkResponse;
import io.snipli.dto.LinkStatsResponse;
import io.snipli.service.LinkService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
        controllers = {LinkController.class, RedirectController.class, HealthController.class},
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = {io.snipli.config.SecurityFilter.class, io.snipli.config.SnipliProperties.class}
        )
)
class ControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private LinkService linkService;


    @Test
    void createLink_returns201() throws Exception {
        Instant now = Instant.now();
        CreateLinkResponse resp = new CreateLinkResponse(
                "abc1234", "https://snipli.io/abc1234",
                "https://example.com", null, now);
        when(linkService.shorten(any())).thenReturn(resp);

        mockMvc.perform(post("/api/v1/links")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"url":"https://example.com"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.shortCode").value("abc1234"))
                .andExpect(jsonPath("$.shortUrl").value("https://snipli.io/abc1234"));
    }

    @Test
    void redirect_returns301() throws Exception {
        when(linkService.resolve("abc1234")).thenReturn("https://example.com");

        mockMvc.perform(get("/abc1234"))
                .andExpect(status().isMovedPermanently())
                .andExpect(header().string("Location", "https://example.com"));
    }

    @Test
    void health_returns200() throws Exception {
        mockMvc.perform(get("/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ok"));
    }

    @Test
    void getStats_returns200() throws Exception {
        Instant now = Instant.now();
        LinkStatsResponse stats = new LinkStatsResponse(
                "abc1234", "https://example.com", 42, now, null, now);
        when(linkService.getStats("abc1234")).thenReturn(stats);

        mockMvc.perform(get("/api/v1/links/abc1234/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.shortCode").value("abc1234"))
                .andExpect(jsonPath("$.totalClicks").value(42));
    }
}
