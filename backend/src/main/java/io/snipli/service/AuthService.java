package io.snipli.service;

import io.snipli.dto.*;
import io.snipli.exception.AuthException;
import io.snipli.exception.SnipliException;
import io.snipli.model.User;
import io.snipli.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtTokenService jwtTokenService;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, JwtTokenService jwtTokenService) {
        this.userRepository = userRepository;
        this.jwtTokenService = jwtTokenService;
        this.passwordEncoder = new BCryptPasswordEncoder(12);
    }

    public AuthResponse register(RegisterRequest request) {
        String email = request.email().toLowerCase().trim();

        if (userRepository.findByEmail(email).isPresent()) {
            throw new AuthException("EMAIL_ALREADY_EXISTS", "A user with this email address already exists", HttpStatus.CONFLICT);
        }

        String userId = "usr_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        String passwordHash = passwordEncoder.encode(request.password());
        String workspace = (request.workspace() != null && !request.workspace().isBlank())
                ? request.workspace().trim()
                : request.name() + "'s Workspace";
        String apiKey = "snip_live_" + UUID.randomUUID().toString().replace("-", "");

        User user = new User(
                userId,
                request.name().trim(),
                email,
                passwordHash,
                workspace,
                apiKey,
                Instant.now()
        );

        userRepository.save(user);

        String token = jwtTokenService.generateToken(user);
        return AuthResponse.of(token, 86400L, UserResponse.from(user));
    }

    public AuthResponse login(AuthRequest request) {
        String email = request.email().toLowerCase().trim();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException("INVALID_CREDENTIALS", "Invalid email or password", HttpStatus.UNAUTHORIZED));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new AuthException("INVALID_CREDENTIALS", "Invalid email or password", HttpStatus.UNAUTHORIZED);
        }

        String token = jwtTokenService.generateToken(user);
        return AuthResponse.of(token, 86400L, UserResponse.from(user));
    }

    public UserResponse getProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthException("USER_NOT_FOUND", "User account not found", HttpStatus.NOT_FOUND));
        return UserResponse.from(user);
    }
}
