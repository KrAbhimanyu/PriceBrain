package com.pricebrain.shared.api;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import org.springframework.data.domain.Page;

import java.time.Instant;
import java.util.List;

/**
 * Standard API response wrapper for all endpoints.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Standard API response wrapper")
public class ApiResponse<T> {

    @Schema(description = "Indicates if the request was successful", example = "true")
    private boolean success;

    @Schema(description = "Response message", example = "Operation completed successfully")
    private String message;

    @Schema(description = "Response data payload")
    private T data;

    @Schema(description = "Error details (only present on failure)")
    private ErrorDetails error;

    @Schema(description = "Response timestamp")
    @Builder.Default
    private Instant timestamp = Instant.now();

    @Schema(description = "Request correlation ID for tracing")
    private String correlationId;

    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message("Success")
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> success() {
        return ApiResponse.<T>builder()
                .success(true)
                .message("Success")
                .build();
    }

    public static <T> ApiResponse<T> error(String code, String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .error(ErrorDetails.builder()
                        .code(code)
                        .message(message)
                        .build())
                .build();
    }

    public static <T> ApiResponse<T> error(ErrorDetails error) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(error.getMessage())
                .error(error)
                .build();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Schema(description = "Error details")
    public static class ErrorDetails {
        @Schema(description = "Error code", example = "AUTH_001")
        private String code;

        @Schema(description = "Error message", example = "Invalid credentials")
        private String message;

        @Schema(description = "Detailed error description")
        private String details;

        @Schema(description = "Field validation errors")
        private List<FieldError> fieldErrors;

        @Schema(description = "Original exception class")
        private String exception;

        @Schema(description = "Documentation URL for this error")
        private String documentationUrl;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Field validation error")
    public static class FieldError {
        @Schema(description = "Field name", example = "email")
        private String field;

        @Schema(description = "Rejected value")
        private Object rejectedValue;

        @Schema(description = "Validation error message", example = "must be a valid email address")
        private String message;

        @Schema(description = "Error code", example = "email.invalid")
        private String code;
    }
}

/**
 * Paginated response wrapper.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Paginated response wrapper")
class PagedResponse<T> {

    @Schema(description = "List of items in current page")
    private List<T> content;

    @Schema(description = "Current page number (0-indexed)")
    private int page;

    @Schema(description = "Page size")
    private int size;

    @Schema(description = "Total number of elements")
    private long totalElements;

    @Schema(description = "Total number of pages")
    private int totalPages;

    @Schema(description = "Is this the first page?")
    private boolean first;

    @Schema(description = "Is this the last page?")
    private boolean last;

    @Schema(description = "Number of elements in current page")
    private int numberOfElements;

    @Schema(description = "Sorting applied to this page")
    private String sort;

    public static <T> PagedResponse<T> of(Page<T> page) {
        return PagedResponse.<T>builder()
                .content(page.getContent())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .numberOfElements(page.getNumberOfElements())
                .sort(page.getSort().toString())
                .build();
    }
}
