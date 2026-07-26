package com.pricebrain.api_gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Gateway Route Configuration.
 * Defines all routes for the microservices.
 */
@Configuration
public class GatewayConfig {

    /**
     * Configure routes for all services.
     * 
     * Route Structure:
     * /api/v1/{service}/* -> lb://{service-name}
     */
    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                // Auth Service
                .route("auth-service", r -> r
                        .path("/api/v1/auth/**")
                        .filters(f -> f
                                .stripPrefix(2)
                                .addRequestHeader("X-Gateway", "pricebrain-gateway")
                                .circuitBreaker(c -> c
                                        .setName("authCircuitBreaker")
                                        .setFallbackUri("forward:/fallback/auth")))
                        .uri("lb://auth-service"))

                // User Service
                .route("user-service", r -> r
                        .path("/api/v1/users/**")
                        .filters(f -> f
                                .stripPrefix(2)
                                .addRequestHeader("X-Gateway", "pricebrain-gateway")
                                .circuitBreaker(c -> c
                                        .setName("userCircuitBreaker")
                                        .setFallbackUri("forward:/fallback/user")))
                        .uri("lb://user-service"))

                // Product Service
                .route("product-service", r -> r
                        .path("/api/v1/products/**")
                        .filters(f -> f
                                .stripPrefix(2)
                                .addRequestHeader("X-Gateway", "pricebrain-gateway")
                                .cacheResponseBody(true)
                                .circuitBreaker(c -> c
                                        .setName("productCircuitBreaker")
                                        .setFallbackUri("forward:/fallback/product")))
                        .uri("lb://product-service"))

                // Order Service
                .route("order-service", r -> r
                        .path("/api/v1/orders/**")
                        .filters(f -> f
                                .stripPrefix(2)
                                .addRequestHeader("X-Gateway", "pricebrain-gateway")
                                .circuitBreaker(c -> c
                                        .setName("orderCircuitBreaker")
                                        .setFallbackUri("forward:/fallback/order")))
                        .uri("lb://order-service"))

                // Payment Service
                .route("payment-service", r -> r
                        .path("/api/v1/payments/**")
                        .filters(f -> f
                                .stripPrefix(2)
                                .addRequestHeader("X-Gateway", "pricebrain-gateway")
                                .circuitBreaker(c -> c
                                        .setName("paymentCircuitBreaker")
                                        .setFallbackUri("forward:/fallback/payment")))
                        .uri("lb://payment-service"))

                // Notification Service
                .route("notification-service", r -> r
                        .path("/api/v1/notifications/**")
                        .filters(f -> f
                                .stripPrefix(2)
                                .addRequestHeader("X-Gateway", "pricebrain-gateway"))
                        .uri("lb://notification-service"))

                // AI Service
                .route("ai-service", r -> r
                        .path("/api/v1/ai/**")
                        .filters(f -> f
                                .stripPrefix(2)
                                .addRequestHeader("X-Gateway", "pricebrain-gateway")
                                .requestTimeout(org.springframework.cloud.gateway.support.TimeoutProperties.builder()
                                        .readTimeout(java.time.Duration.ofSeconds(30))
                                        .writeTimeout(java.time.Duration.ofSeconds(30))
                                        .build()))
                        .uri("lb://ai-service"))

                // Analytics Service
                .route("analytics-service", r -> r
                        .path("/api/v1/analytics/**")
                        .filters(f -> f
                                .stripPrefix(2)
                                .addRequestHeader("X-Gateway", "pricebrain-gateway"))
                        .uri("lb://analytics-service"))

                // Search Service
                .route("search-service", r -> r
                        .path("/api/v1/search/**")
                        .filters(f -> f
                                .stripPrefix(2)
                                .addRequestHeader("X-Gateway", "pricebrain-gateway")
                                .cacheResponseBody(true))
                        .uri("lb://search-service"))

                // Seller Service
                .route("seller-service", r -> r
                        .path("/api/v1/sellers/**")
                        .filters(f -> f
                                .stripPrefix(2)
                                .addRequestHeader("X-Gateway", "pricebrain-gateway"))
                        .uri("lb://seller-service"))

                // Inventory Service
                .route("inventory-service", r -> r
                        .path("/api/v1/inventory/**")
                        .filters(f -> f
                                .stripPrefix(2)
                                .addRequestHeader("X-Gateway", "pricebrain-gateway"))
                        .uri("lb://inventory-service"))

                .build();
    }
}
