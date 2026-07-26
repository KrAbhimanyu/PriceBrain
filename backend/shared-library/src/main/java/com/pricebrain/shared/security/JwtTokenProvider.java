package com.pricebrain.shared.security;

import com.pricebrain.shared.model.UserRole;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

/**
 * JWT Token Provider for generating and validating JWT tokens.
 */
@Slf4j
@Component
public class JwtTokenProvider {

    @Value("${security.jwt.secret:default-secret-key-for-development-only-change-in-production}")
    private String jwtSecret;

    @Value("${security.jwt.access-token-expiry:3600}")
    private long accessTokenExpiry;

    @Value("${security.jwt.refresh-token-expiry:604800}")
    private long refreshTokenExpiry;

    private SecretKey secretKey;

    @PostConstruct
    public void init() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 64) {
            // Pad the key to 64 bytes for HS512
            byte[] paddedKey = new byte[64];
            System.arraycopy(keyBytes, 0, paddedKey, 0, keyBytes.length);
            keyBytes = paddedKey;
        }
        this.secretKey = Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Generate access token for a user.
     */
    public String generateAccessToken(UUID userId, String email, UserRole role, 
                                     Set<String> permissions, Map<String, Object> additionalClaims) {
        Instant now = Instant.now();
        Instant expiry = now.plus(accessTokenExpiry, ChronoUnit.SECONDS);

        JwtBuilder builder = Jwts.builder()
                .id(UUID.randomUUID().toString())
                .subject(userId.toString())
                .claim("email", email)
                .claim("role", role.name())
                .claim("permissions", permissions)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .issuer("PriceBrain")
                .signWith(secretKey);

        if (additionalClaims != null) {
            additionalClaims.forEach(builder::claim);
        }

        return builder.compact();
    }

    /**
     * Generate refresh token for a user.
     */
    public String generateRefreshToken(UUID userId) {
        Instant now = Instant.now();
        Instant expiry = now.plus(refreshTokenExpiry, ChronoUnit.SECONDS);

        return Jwts.builder()
                .id(UUID.randomUUID().toString())
                .subject(userId.toString())
                .claim("type", "refresh")
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .issuer("PriceBrain")
                .signWith(secretKey)
                .compact();
    }

    /**
     * Validate and parse a JWT token.
     */
    public JwtClaims parseToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            return JwtClaims.builder()
                    .userId(UUID.fromString(claims.getSubject()))
                    .email(claims.get("email", String.class))
                    .role(UserRole.valueOf(claims.get("role", String.class)))
                    .permissions(new HashSet<>((List<String>) claims.get("permissions", List.class)))
                    .issuedAt(claims.getIssuedAt().toInstant())
                    .expiresAt(claims.getExpiration().toInstant())
                    .tokenId(claims.getId())
                    .build();

        } catch (ExpiredJwtException e) {
            log.warn("JWT token expired: {}", e.getMessage());
            throw new SecurityException("Token expired");
        } catch (JwtException e) {
            log.warn("Invalid JWT token: {}", e.getMessage());
            throw new SecurityException("Invalid token");
        }
    }

    /**
     * Check if a token is valid without parsing its claims.
     */
    public boolean isTokenValid(String token) {
        try {
            Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException e) {
            return false;
        }
    }

    /**
     * Extract user ID from token.
     */
    public UUID getUserIdFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return UUID.fromString(claims.getSubject());
    }

    /**
     * Get token expiry date.
     */
    public Instant getTokenExpiry(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return claims.getExpiration().toInstant();
    }

    @lombok.Builder
    @lombok.Data
    public static class JwtClaims {
        private UUID userId;
        private String email;
        private UserRole role;
        private Set<String> permissions;
        private Instant issuedAt;
        private Instant expiresAt;
        private String tokenId;
    }
}
