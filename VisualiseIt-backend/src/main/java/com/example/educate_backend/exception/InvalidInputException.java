package com.example.educate_backend.exception;

/**
 * Custom exception for invalid input/validation errors.
 */
public class InvalidInputException extends RuntimeException {

    public InvalidInputException(String message) {
        super(message);
    }

    public InvalidInputException(String message, Throwable cause) {
        super(message, cause);
    }
}
