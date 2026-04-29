package io.snipli.util;

import java.security.SecureRandom;

public final class ShortCodeGenerator {

    private static final String BASE62_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    private static final int CODE_LENGTH = 7;
    private static final SecureRandom RANDOM = new SecureRandom();

    private ShortCodeGenerator() {
        // utility class
    }

    /**
     * Generate a 7-character Base62 short code from a SecureRandom long.
     */
    public static String generate() {
        long value = Math.abs(RANDOM.nextLong());
        StringBuilder sb = new StringBuilder(CODE_LENGTH);
        for (int i = 0; i < CODE_LENGTH; i++) {
            sb.append(BASE62_CHARS.charAt((int) (value % 62)));
            value /= 62;
        }
        return sb.toString();
    }
}
