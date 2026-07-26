package com.pricebrain.shared.interceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import java.util.UUID;

/**
 * Interceptor for logging HTTP requests and responses with correlation ID.
 */
@Component
@Slf4j
public class RequestLoggingInterceptor implements HandlerInterceptor {

    public static final String CORRELATION_ID_HEADER = "X-Correlation-ID";
    public static final String CORRELATION_ID_ATTRIBUTE = "correlationId";
    public static final String START_TIME_ATTRIBUTE = "requestStartTime";

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // Get or generate correlation ID
        String correlationId = request.getHeader(CORRELATION_ID_HEADER);
        if (correlationId == null || correlationId.isEmpty()) {
            correlationId = UUID.randomUUID().toString();
        }

        // Store correlation ID in request attributes
        request.setAttribute(CORRELATION_ID_ATTRIBUTE, correlationId);
        response.setHeader(CORRELATION_ID_HEADER, correlationId);

        // Record start time
        request.setAttribute(START_TIME_ATTRIBUTE, System.currentTimeMillis());

        // Log request
        logRequest(request, correlationId);

        return true;
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, 
                           Object handler, ModelAndView modelAndView) {
        // No action needed post-handle
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response,
                                 Object handler, Exception ex) {
        String correlationId = (String) request.getAttribute(CORRELATION_ID_ATTRIBUTE);
        Long startTime = (Long) request.getAttribute(START_TIME_ATTRIBUTE);

        // Calculate duration
        long duration = 0;
        if (startTime != null) {
            duration = System.currentTimeMillis() - startTime;
        }

        // Log response
        logResponse(request, response, correlationId, duration, ex);
    }

    private void logRequest(HttpServletRequest request, String correlationId) {
        String method = request.getMethod();
        String uri = request.getRequestURI();
        String query = request.getQueryString();
        String remoteAddr = getClientIp(request);
        String userAgent = request.getHeader("User-Agent");
        String userId = request.getHeader("X-User-ID");

        if (query != null && !query.isEmpty()) {
            uri = uri + "?" + query;
        }

        log.info("[{}] {} {} - Client: {} - User: {} - UA: {}",
                correlationId,
                method,
                uri,
                remoteAddr,
                userId != null ? userId : "anonymous",
                truncate(userAgent, 100));
    }

    private void logResponse(HttpServletRequest request, HttpServletResponse response,
                             String correlationId, long duration, Exception ex) {
        int status = response.getStatus();
        String method = request.getMethod();
        String uri = request.getRequestURI();

        if (status >= 500) {
            log.error("[{}] {} {} - Status: {} - Duration: {}ms",
                    correlationId, method, uri, status, duration);
        } else if (status >= 400) {
            log.warn("[{}] {} {} - Status: {} - Duration: {}ms",
                    correlationId, method, uri, status, duration);
        } else {
            log.info("[{}] {} {} - Status: {} - Duration: {}ms",
                    correlationId, method, uri, status, duration);
        }

        // Log exception if present
        if (ex != null) {
            log.error("[{}] Exception in request {}: {}",
                    correlationId, uri, ex.getMessage(), ex);
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        return request.getRemoteAddr();
    }

    private String truncate(String str, int maxLength) {
        if (str == null) {
            return null;
        }
        if (str.length() <= maxLength) {
            return str;
        }
        return str.substring(0, maxLength) + "...";
    }
}
