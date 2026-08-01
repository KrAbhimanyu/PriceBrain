package com.pricebrain.shared.exceptions;

import org.springframework.http.HttpStatus;

/**
 * Authentication-related exceptions.
 */
public class AuthExceptions {

    private AuthExceptions() {}

    public static class InvalidCredentialsException extends PriceBrainException {
        public InvalidCredentialsException() {
            super("Invalid email or password", "AUTH_INVALID_CREDENTIALS", HttpStatus.UNAUTHORIZED);
        }
    }

    public static class TokenExpiredException extends PriceBrainException {
        public TokenExpiredException() {
            super("Authentication token has expired", "AUTH_TOKEN_EXPIRED", HttpStatus.UNAUTHORIZED);
        }
    }

    public static class TokenInvalidException extends PriceBrainException {
        public TokenInvalidException(String message) {
            super(message, "AUTH_TOKEN_INVALID", HttpStatus.UNAUTHORIZED);
        }
    }

    public static class AccountLockedException extends PriceBrainException {
        public AccountLockedException() {
            super("Account is temporarily locked due to multiple failed login attempts", "AUTH_ACCOUNT_LOCKED", HttpStatus.FORBIDDEN);
        }
    }

    public static class EmailNotVerifiedException extends PriceBrainException {
        public EmailNotVerifiedException() {
            super("Please verify your email address", "AUTH_EMAIL_NOT_VERIFIED", HttpStatus.FORBIDDEN);
        }
    }

    public static class UserAlreadyExistsException extends PriceBrainException {
        public UserAlreadyExistsException(String email) {
            super("User with email " + email + " already exists", "AUTH_USER_EXISTS", HttpStatus.CONFLICT);
        }
    }

    public static class InvalidTokenException extends PriceBrainException {
        public InvalidTokenException(String tokenType) {
            super("Invalid or expired " + tokenType + " token", "AUTH_INVALID_TOKEN", HttpStatus.BAD_REQUEST);
        }
    }

    public static class InsufficientPermissionsException extends PriceBrainException {
        public InsufficientPermissionsException() {
            super("You do not have permission to perform this action", "AUTH_INSUFFICIENT_PERMISSIONS", HttpStatus.FORBIDDEN);
        }
    }
}
