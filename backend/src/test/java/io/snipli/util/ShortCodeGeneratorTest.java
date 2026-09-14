package io.snipli.util;

import org.junit.jupiter.api.RepeatedTest;
import org.junit.jupiter.api.Test;

import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class ShortCodeGeneratorTest {

    private static final String BASE62_PATTERN = "^[0-9A-Za-z]+$";

    @Test
    void generate_returnsCodeOfLength7() {
        String code = ShortCodeGenerator.generate();
        assertEquals(7, code.length());
    }

    @Test
    void generate_returnsBase62Characters() {
        for (int i = 0; i < 100; i++) {
            String code = ShortCodeGenerator.generate();
            assertTrue(code.matches(BASE62_PATTERN),
                    "Code '" + code + "' contains non-Base62 characters");
        }
    }

    @RepeatedTest(5)
    void generate_producesUniqueCodesAcrossMultipleCalls() {
        Set<String> codes = new HashSet<>();
        int count = 10_000;
        for (int i = 0; i < count; i++) {
            codes.add(ShortCodeGenerator.generate());
        }
        // With 62^7 ≈ 3.5 trillion possibilities, collisions in 10k should be near zero
        assertEquals(count, codes.size(), "Detected collision among " + count + " codes");
    }

    @Test
    void generate_neverReturnsNull() {
        for (int i = 0; i < 100; i++) {
            assertNotNull(ShortCodeGenerator.generate());
        }
    }
}
