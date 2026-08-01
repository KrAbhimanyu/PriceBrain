package com.pricebrain.api_gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * PriceBrain API Gateway Application.
 * 
 * This is the central entry point for all client requests.
 * Responsibilities:
 * - Authentication & Authorization
 * - Rate Limiting
 * - Request Routing
 * - API Versioning
 * - Monitoring & Logging
 * - Circuit Breaker
 * - Response Caching
 */
@SpringBootApplication
@EnableDiscoveryClient
public class ApiGatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }
}
