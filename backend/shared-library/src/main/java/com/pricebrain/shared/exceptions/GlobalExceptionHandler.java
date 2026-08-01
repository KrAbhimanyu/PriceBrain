package com.pricebrain.shared.exceptions;

import com.pricebrain.shared.dto.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Global exception handler for consistent error responses across all services.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(PriceBrainException.class)
    public ResponseEntity<ApiResponse<Void>> handlePriceBrainException(
            PriceBrainException ex, HttpServletRequest request) {
        log.warn("PriceBrain exception: {} - {}", ex.getErrorCode(), ex.getMessage());
        
        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .success(false)
                .error(ApiResponse.ErrorDetails.builder()
                        .code(ex.getErrorCode())
                        .message(ex.getMessage())
                        .path(request.getRequestURI())
                        .build())
                .timestamp(java.time.Instant.now())
                .build();
        
        return ResponseEntity.status(ex.getHttpStatus()).body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        List<String> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(this::formatFieldError)
                .collect(Collectors.toList());
        
        log.warn("Validation failed: {}", errors);
        
        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .success(false)
                .error(ApiResponse.ErrorDetails.builder()
                        .code("VALIDATION_ERROR")
                        .message("Request validation failed")
                        .details(errors)
                        .path(request.getRequestURI())
                        .build())
                .timestamp(java.time.Instant.now())
                .build();
        
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDeniedException(
            AccessDeniedException ex, HttpServletRequest request) {
        log.warn("Access denied: {} - {}", request.getRequestURI(), ex.getMessage());
        
        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .success(false)
                .error(ApiResponse.ErrorDetails.builder()
                        .code("ACCESS_DENIED")
                        .message("You do not have permission to access this resource")
                        .path(request.getRequestURI())
                        .build())
                .timestamp(java.time.Instant.now())
                .build();
        
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(
            Exception ex, HttpServletRequest request) {
        log.error("Unexpected error at {}: {}", request.getRequestURI(), ex.getMessage(), ex);
        
        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .success(false)
                .error(ApiResponse.ErrorDetails.builder()
                        .code("INTERNAL_ERROR")
                        .message("An unexpected error occurred. Please try again later.")
                        .path(request.getRequestURI())
                        .build())
                .timestamp(java.time.Instant.now())
                .build();
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    private String formatFieldError(FieldError error) {
        return error.getField() + ": " + error.getDefaultMessage();
    }
}
