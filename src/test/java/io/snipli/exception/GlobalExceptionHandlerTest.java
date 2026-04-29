package io.snipli.exception;

import io.snipli.dto.ErrorResponse;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.*;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void urlValidationException_returns400() {
        ResponseEntity<ErrorResponse> response =
                handler.handleUrlValidation(new UrlValidationException("Bad URL"));
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("INVALID_URL", response.getBody().error());
    }

    @Test
    void linkNotFoundException_returns404() {
        ResponseEntity<ErrorResponse> response =
                handler.handleNotFound(new LinkNotFoundException("Not found"));
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("LINK_NOT_FOUND", response.getBody().error());
    }

    @Test
    void linkExpiredException_returns410() {
        ResponseEntity<ErrorResponse> response =
                handler.handleExpired(new LinkExpiredException("Expired"));
        assertEquals(HttpStatus.GONE, response.getStatusCode());
        assertEquals("LINK_EXPIRED", response.getBody().error());
    }

    @Test
    void codeConflictException_returns409() {
        ResponseEntity<ErrorResponse> response =
                handler.handleConflict(new CodeConflictException("Taken"));
        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertEquals("CODE_CONFLICT", response.getBody().error());
    }

    @Test
    void codeGenerationException_returns500() {
        ResponseEntity<ErrorResponse> response =
                handler.handleCodeGeneration(new CodeGenerationException("Failed"));
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals("CODE_GENERATION_FAILED", response.getBody().error());
    }

    @Test
    void genericException_returns500_withoutStackTrace() {
        ResponseEntity<ErrorResponse> response =
                handler.handleAll(new RuntimeException("something bad"));
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals("INTERNAL_ERROR", response.getBody().error());
        assertEquals("An unexpected error occurred", response.getBody().message());
    }
}
