package io.snipli.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;

@Component
@Order(1)
public class SecurityFilter extends OncePerRequestFilter {

    private final SnipliProperties properties;

    public SecurityFilter(SnipliProperties properties) {
        this.properties = properties;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // Always allow CORS preflight requests
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String path = request.getRequestURI();

        // Protect /api/** endpoints with API key
        if (path.startsWith("/api/")) {
            String apiKey = request.getHeader("X-Api-Key");
            String configuredApiKey = properties.getApiKey();

            // If API key is configured, enforce it
            if (configuredApiKey != null && !configuredApiKey.isBlank()) {
                if (apiKey == null || !apiKey.equals(configuredApiKey)) {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write("""
                            {"error":"UNAUTHORIZED","message":"Missing or invalid API key","timestamp":"%s"}
                            """.formatted(Instant.now().toString()));
                    return;
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}
