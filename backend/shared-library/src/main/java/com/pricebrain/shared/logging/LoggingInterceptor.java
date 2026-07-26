package com.pricebrain.shared.logging;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

/**
 * Interceptor for adding correlation IDs and logging request/response details.
 */
@Slf4j
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class LoggingInterceptor implements Filter {

    private static final String CORRELATION_ID_HEADER = "X-Correlation-ID";
    private static final String REQUEST_ID_HEADER = "X-Request-ID";
    private static final String USER_ID_HEADER = "X-User-ID";

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        long startTime = System.currentTimeMillis();

        // Get or generate correlation ID
        String correlationId = httpRequest.getHeader(CORRELATION_ID_HEADER);
        if (correlationId == null || correlationId.isEmpty()) {
            correlationId = UUID.randomUUID().toString();
        }

        // Generate request ID
        String requestId = UUID.randomUUID().toString();

        // Set MDC context
        MDC.put("correlationId", correlationId);
        MDC.put("requestId", requestId);
        MDC.put("method", httpRequest.getMethod());
        MDC.put("path", httpRequest.getRequestURI());

        // Add correlation ID to response headers
        httpResponse.setHeader(CORRELATION_ID_HEADER, correlationId);
        httpResponse.setHeader(REQUEST_ID_HEADER, requestId);

        // Extract user ID if present
        String userId = httpRequest.getHeader(USER_ID_HEADER);
        if (userId != null) {
            MDC.put("userId", userId);
        }

        try {
            log.info("Incoming request: {} {} from {}",
                    httpRequest.getMethod(),
                    httpRequest.getRequestURI(),
                    httpRequest.getRemoteAddr());

            chain.doFilter(request, response);

        } finally {
            long duration = System.currentTimeMillis() - startTime;

            log.info("Completed request: {} {} - Status: {} - Duration: {}ms",
                    httpRequest.getMethod(),
                    httpRequest.getRequestURI(),
                    httpResponse.getStatus(),
                    duration);

            // Add timing header
            httpResponse.setHeader("X-Response-Time", duration + "ms");

            MDC.clear();
        }
    }
}
