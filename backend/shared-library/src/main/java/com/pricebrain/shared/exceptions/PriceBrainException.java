package com.pricebrain.shared.exceptions;

import org.springframework.http.HttpStatus;

/**
 * Base exception class for all PriceBrain application exceptions.
 */
public abstract class PriceBrainException extends RuntimeException {

    private final String errorCode;
    private final HttpStatus httpStatus;

    protected PriceBrainException(String message, String errorCode, HttpStatus httpStatus) {
        super(message);
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
    }

    protected PriceBrainException(String message, String errorCode, HttpStatus httpStatus, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }
}
