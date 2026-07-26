package com.pricebrain.shared.api;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.*;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * OpenAPI 3.0 configuration for PriceBrain API documentation.
 */
@Configuration
public class OpenApiConfig {

    @Value("${app.version:1.0.0}")
    private String appVersion;

    @Value("${app.host:api.pricebrain.com}")
    private String appHost;

    @Bean
    public OpenAPI priceBrainOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("PriceBrain AI Marketplace API")
                        .description("""
                                ## Enterprise AI-Powered Marketplace Platform
                                
                                PriceBrain is an AI-driven e-commerce platform that helps buyers find the best deals 
                                and sellers reach more customers through intelligent recommendations.
                                
                                ### Core Features
                                - **AI-Powered Search**: Natural language product discovery
                                - **Smart Recommendations**: Personalized product suggestions
                                - **Price Intelligence**: Real-time price monitoring and alerts
                                - **Ask Brain AI**: Conversational shopping assistant
                                - **Seller Intelligence**: Business insights and optimization
                                
                                ### API Versioning
                                All APIs are versioned using URL path prefixing (e.g., `/api/v1/`).
                                
                                ### Authentication
                                APIs use JWT Bearer token authentication. Include the token in the Authorization header:
                                ```
                                Authorization: Bearer <your_token>
                                ```
                                
                                ### Rate Limiting
                                API requests are rate-limited based on subscription tier:
                                - Free: 100 requests/minute
                                - Pro: 1,000 requests/minute
                                - Enterprise: 10,000 requests/minute
                                
                                ### Support
                                For API support, contact api-support@pricebrain.com
                                """)
                        .version(appVersion)
                        .contact(new Contact()
                                .name("PriceBrain API Team")
                                .email("api-support@pricebrain.com")
                                .url("https://pricebrain.com/support"))
                        .license(new License()
                                .name("Proprietary")
                                .url("https://pricebrain.com/license"))
                        .termsOfService("https://pricebrain.com/terms"))
                .servers(List.of(
                        new Server()
                                .url("https://" + appHost)
                                .description("Production Server"),
                        new Server()
                                .url("https://staging-api.pricebrain.com")
                                .description("Staging Server"),
                        new Server()
                                .url("http://localhost:8080")
                                .description("Local Development")))
                .tags(List.of(
                        new Tag().name("Auth").description("Authentication & Authorization"),
                        new Tag().name("Users").description("User Management"),
                        new Tag().name("Products").description("Product Catalog"),
                        new Tag().name("Orders").description("Order Management"),
                        new Tag().name("Cart").description("Shopping Cart"),
                        new Tag().name("Wishlist").description("Wishlist Management"),
                        new Tag().name("Payments").description("Payment Processing"),
                        new Tag().name("Reviews").description("Product Reviews"),
                        new Tag().name("Notifications").description("Notifications"),
                        new Tag().name("Sellers").description("Seller Management"),
                        new Tag().name("AI").description("AI Services"),
                        new Tag().name("Analytics").description("Analytics & Reporting"),
                        new Tag().name("Search").description("Search Services")))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("JWT Bearer token authentication"))
                        .addSecuritySchemes("apiKey", new SecurityScheme()
                                .type(SecurityScheme.Type.APIKEY)
                                .in(SecurityScheme.In.HEADER)
                                .name("X-API-Key")
                                .description("API Key authentication"))
                        .addSecuritySchemes("refreshToken", new SecurityScheme()
                                .type(SecurityScheme.Type.APIKEY)
                                .in(SecurityScheme.In.COOKIE)
                                .name("refresh_token")
                                .description("Refresh token for token renewal"))
                        .addParameters("correlationId", new io.swagger.v3.oas.models.parameters.Parameter()
                                .name("X-Correlation-ID")
                                .in(io.swagger.v3.oas.models.parameters.Parameter.In.HEADER)
                                .description("Unique request correlation ID for tracing")
                                .schema(new io.swagger.v3.oas.models.media.StringSchema()))
                        .addHeaders("X-Rate-Limit-Remaining", new io.swagger.v3.oas.models.headers.Header()
                                .description("Remaining API requests in current window")
                                .schema(new io.swagger.v3.oas.models.media.IntegerSchema()))
                        .addHeaders("X-Rate-Limit-Reset", new io.swagger.v3.oas.models.headers.Header()
                                .description("Unix timestamp when rate limit resets")
                                .schema(new io.swagger.v3.oas.models.media.IntegerSchema())));
    }
}
