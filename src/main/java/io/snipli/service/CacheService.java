package io.snipli.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;

@Service
public class CacheService {

    private static final Logger log = LoggerFactory.getLogger(CacheService.class);
    private static final String KEY_PREFIX = "snipli:link:";
    private static final Duration MAX_TTL = Duration.ofHours(24);

    private final RedisTemplate<String, String> redisTemplate;

    public CacheService(RedisTemplate<String, String> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    /**
     * Retrieve a cached original URL by short code.
     */
    public Optional<String> get(String shortCode) {
        try {
            String value = redisTemplate.opsForValue().get(KEY_PREFIX + shortCode);
            return Optional.ofNullable(value);
        } catch (Exception e) {
            log.warn("Redis GET failed for code={}, falling through to Firestore", shortCode, e);
            return Optional.empty();
        }
    }

    /**
     * Cache the original URL with TTL = min(24h, remaining time until expiresAt).
     */
    public void put(String shortCode, String originalUrl, Instant expiresAt) {
        try {
            Duration ttl = MAX_TTL;
            if (expiresAt != null) {
                Duration remaining = Duration.between(Instant.now(), expiresAt);
                if (remaining.isPositive() && remaining.compareTo(MAX_TTL) < 0) {
                    ttl = remaining;
                }
            }
            redisTemplate.opsForValue().set(KEY_PREFIX + shortCode, originalUrl, ttl);
        } catch (Exception e) {
            log.warn("Redis SET failed for code={}", shortCode, e);
        }
    }
}
