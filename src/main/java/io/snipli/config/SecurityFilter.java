package io.snipli.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

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

        String path = request.getRequestURI();

        // Only protect /api/** endpoints
        if (path.startsWith("/api/")) {
            String apiKey = request.getHeader("X-Api-Key");
            if (apiKey == null || !apiKey.equals(properties.getApiKey())) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("""
                        {"error":"UNAUTHORIZED","message":"Missing or invalid API key","timestamp":"%s"}
                        """.formatted(java.time.Instant.now().toString()));
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
