package io.snipli.config;

import io.jsonwebtoken.Claims;
import io.snipli.service.JwtTokenService;
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
    private final JwtTokenService jwtTokenService;

    public SecurityFilter(SnipliProperties properties, JwtTokenService jwtTokenService) {
        this.properties = properties;
        this.jwtTokenService = jwtTokenService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // 1. Always allow CORS preflight requests
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String path = request.getRequestURI();

        // 2. Allow public endpoints (Auth endpoints, health actuator, redirect paths)
        if (path.startsWith("/api/v1/auth/") ||
            path.startsWith("/actuator") ||
            path.startsWith("/api/v1/tasks/") ||
            !path.startsWith("/api/")) {

            // Still check for optional JWT token on public endpoints (e.g. /me or create with token)
            extractAndAttachUser(request);
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Extract and validate JWT Token if present
        extractAndAttachUser(request);

        filterChain.doFilter(request, response);
    }


    private boolean extractAndAttachUser(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7).trim();
            try {
                Claims claims = jwtTokenService.validateToken(token);
                String userId = claims.get("userId", String.class);
                String email = claims.getSubject();
                String workspace = claims.get("workspace", String.class);

                request.setAttribute("authenticatedUserId", userId);
                request.setAttribute("authenticatedUserEmail", email);
                request.setAttribute("authenticatedUserWorkspace", workspace);
                return true;
            } catch (Exception ignored) {
                // Invalid or expired token
            }
        }
        return false;
    }
}
