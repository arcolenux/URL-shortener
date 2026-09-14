package io.snipli.service;

import io.snipli.config.SnipliProperties;
import io.snipli.dto.AuthRequest;
import io.snipli.dto.AuthResponse;
import io.snipli.dto.RegisterRequest;
import io.snipli.exception.AuthException;
import io.snipli.exception.SnipliException;
import io.snipli.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.*;

class AuthServiceTest {

    private UserRepository userRepository;
    private JwtTokenService jwtTokenService;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        userRepository = new UserRepository(null); // uses in-memory fallback
        SnipliProperties properties = new SnipliProperties();
        jwtTokenService = new JwtTokenService(properties);
        authService = new AuthService(userRepository, jwtTokenService);
    }

    @Test
    void shouldRegisterAndLoginUserSuccessfully() {
        RegisterRequest registerReq = new RegisterRequest("Test User", "test@snipli.io", "password123", "Test Team");
        AuthResponse registerResp = authService.register(registerReq);

        assertNotNull(registerResp);
        assertNotNull(registerResp.token());
        assertEquals("test@snipli.io", registerResp.user().email());
        assertEquals("Test Team", registerResp.user().workspace());

        // Login with correct credentials
        AuthRequest loginReq = new AuthRequest("test@snipli.io", "password123");
        AuthResponse loginResp = authService.login(loginReq);

        assertNotNull(loginResp);
        assertNotNull(loginResp.token());
        assertEquals("test@snipli.io", loginResp.user().email());
    }

    @Test
    void shouldRejectDuplicateEmailRegistration() {
        RegisterRequest registerReq = new RegisterRequest("User One", "dup@snipli.io", "password123", "Team");
        authService.register(registerReq);

        assertThrows(AuthException.class, () -> authService.register(registerReq));
    }

    @Test
    void shouldRejectInvalidPasswordLogin() {
        RegisterRequest registerReq = new RegisterRequest("User", "auth@snipli.io", "correctPass123", "Team");
        authService.register(registerReq);

        AuthRequest badLogin = new AuthRequest("auth@snipli.io", "wrongPass");
        assertThrows(AuthException.class, () -> authService.login(badLogin));
    }
}
