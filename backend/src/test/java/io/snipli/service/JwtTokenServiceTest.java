package io.snipli.service;

import io.jsonwebtoken.Claims;
import io.snipli.config.SnipliProperties;
import io.snipli.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenServiceTest {

    private JwtTokenService jwtTokenService;
    private SnipliProperties properties;

    @BeforeEach
    void setUp() {
        properties = new SnipliProperties();
        jwtTokenService = new JwtTokenService(properties);
    }

    @Test
    void shouldGenerateAndValidateJwtToken() {
        User user = new User("usr_123", "Alex Rivera", "alex@snipli.io", "hashedPass", "Pro Workspace", "snip_key", Instant.now());
        String token = jwtTokenService.generateToken(user);

        assertNotNull(token);
        assertTrue(jwtTokenService.isTokenValid(token));

        Claims claims = jwtTokenService.validateToken(token);
        assertEquals("alex@snipli.io", claims.getSubject());
        assertEquals("usr_123", claims.get("userId", String.class));
        assertEquals("Pro Workspace", claims.get("workspace", String.class));
        assertEquals("usr_123", jwtTokenService.getUserIdFromToken(token));
    }

    @Test
    void shouldRejectInvalidToken() {
        assertFalse(jwtTokenService.isTokenValid("invalid.jwt.token"));
    }
}
