package com.pricebrain.auth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * PriceBrain Authentication Service.
 * 
 * Responsibilities:
 * - User Registration & Login
 * - JWT Token Generation & Validation
 * - Password Management
 * - Session Management
 * - MFA Support
 * - Account Locking
 */
@SpringBootApplication
@EnableDiscoveryClient
public class AuthServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuthServiceApplication.class, args);
    }
}
