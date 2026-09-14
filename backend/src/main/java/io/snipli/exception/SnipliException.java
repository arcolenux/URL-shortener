package io.snipli.exception;

public sealed class SnipliException extends RuntimeException
        permits UrlValidationException, LinkNotFoundException, LinkExpiredException,
                CodeConflictException, CodeGenerationException {

    public SnipliException(String message) {
        super(message);
    }

    public SnipliException(String message, Throwable cause) {
        super(message, cause);
    }
}
