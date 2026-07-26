package com.pricebrain.shared.api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Base controller with common API operations.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1")
public abstract class BaseController {

    /**
     * Standard success response.
     */
    protected <T> ResponseEntity<ApiResponse<T>> success(T data) {
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    /**
     * Success response with custom message.
     */
    protected <T> ResponseEntity<ApiResponse<T>> success(T data, String message) {
        return ResponseEntity.ok(ApiResponse.success(data, message));
    }

    /**
     * Created response (201).
     */
    protected <T> ResponseEntity<ApiResponse<T>> created(T data) {
        return ResponseEntity.status(201).body(ApiResponse.success(data, "Created successfully"));
    }

    /**
     * Created response without body (201).
     */
    protected ResponseEntity<ApiResponse<Void>> created() {
        return ResponseEntity.status(201).body(ApiResponse.<Void>builder().success(true).message("Created successfully").build());
    }

    /**
     * No content response (204).
     */
    protected ResponseEntity<Void> noContent() {
        return ResponseEntity.noContent().build();
    }

    /**
     * Standard error response.
     */
    protected <T> ResponseEntity<ApiResponse<T>> error(ErrorCodes errorCode) {
        return ResponseEntity.status(errorCode.getHttpStatus())
                .body(ApiResponse.error(errorCode.toErrorDetails()));
    }

    /**
     * Error response with custom message.
     */
    protected <T> ResponseEntity<ApiResponse<T>> error(ErrorCodes errorCode, String message) {
        return ResponseEntity.status(errorCode.getHttpStatus())
                .body(ApiResponse.error(errorCode.getCode(), message));
    }

    /**
     * Error response with details.
     */
    protected <T> ResponseEntity<ApiResponse<T>> error(ErrorCodes errorCode, String message, String details) {
        return ResponseEntity.status(errorCode.getHttpStatus())
                .body(ApiResponse.error(errorCode.toErrorDetails(details)));
    }

    /**
     * Validation error response.
     */
    protected <T> ResponseEntity<ApiResponse<T>> validationError(ApiResponse.ErrorDetails errorDetails) {
        return ResponseEntity.badRequest()
                .body(ApiResponse.error(errorDetails));
    }

    /**
     * Get correlation ID from request header.
     */
    protected String getCorrelationId(HttpServletRequest request) {
        String correlationId = request.getHeader("X-Correlation-ID");
        if (correlationId == null || correlationId.isEmpty()) {
            correlationId = UUID.randomUUID().toString();
        }
        return correlationId;
    }

    /**
     * Create pageable from request parameters.
     */
    protected Pageable createPageable(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        // Limit page size
        size = Math.min(size, 100);

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        return PageRequest.of(page, size, sort);
    }

    /**
     * Wrap page response.
     */
    protected <T> PagedResponse<T> wrapPage(Page<T> page) {
        return PagedResponse.of(page);
    }

    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Paginated response wrapper")
    public static class PagedResponse<T> {
        @Schema(description = "List of items in current page")
        private java.util.List<T> content;

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
            PagedResponse<T> response = new PagedResponse<>();
            response.setContent(page.getContent());
            response.setPage(page.getNumber());
            response.setSize(page.getSize());
            response.setTotalElements(page.getTotalElements());
            response.setTotalPages(page.getTotalPages());
            response.setFirst(page.isFirst());
            response.setLast(page.isLast());
            response.setNumberOfElements(page.getNumberOfElements());
            response.setSort(page.getSort().toString());
            return response;
        }
    }
}
