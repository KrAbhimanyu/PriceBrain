package com.pricebrain.shared.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;

/**
 * Redis service for caching, rate limiting, and session management.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RedisService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final StringRedisTemplate stringRedisTemplate;

    // Key prefixes
    private static final String PREFIX_USER = "user:";
    private static final String PREFIX_PRODUCT = "product:";
    private static final String PREFIX_CART = "cart:";
    private static final String PREFIX_SESSION = "session:";
    private static final String PREFIX_RATE_LIMIT = "ratelimit:";
    private static final String PREFIX_LOCK = "lock:";
    private static final String PREFIX_AI = "ai:";
    private static final String PREFIX_VIEW = "view:";

    // ==================== Generic Operations ====================

    public void set(String key, Object value, Duration ttl) {
        try {
            redisTemplate.opsForValue().set(key, value, ttl);
        } catch (Exception e) {
            log.error("Error setting key {}: {}", key, e.getMessage());
        }
    }

    public <T> T get(String key, Class<T> type) {
        try {
            Object value = redisTemplate.opsForValue().get(key);
            if (value != null && type.isInstance(value)) {
                return type.cast(value);
            }
            return null;
        } catch (Exception e) {
            log.error("Error getting key {}: {}", key, e.getMessage());
            return null;
        }
    }

    public <T> Optional<T> getOrCompute(String key, Class<T> type, Supplier<T> compute, Duration ttl) {
        T value = get(key, type);
        if (value != null) {
            return Optional.of(value);
        }
        T computed = compute.get();
        if (computed != null) {
            set(key, computed, ttl);
        }
        return Optional.ofNullable(computed);
    }

    public void delete(String key) {
        redisTemplate.delete(key);
    }

    public boolean exists(String key) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }

    public void expire(String key, Duration ttl) {
        redisTemplate.expire(key, ttl);
    }

    // ==================== Counter Operations ====================

    public long increment(String key) {
        Long value = redisTemplate.opsForValue().increment(key);
        return value != null ? value : 0;
    }

    public long increment(String key, long delta) {
        Long value = redisTemplate.opsForValue().increment(key, delta);
        return value != null ? value : 0;
    }

    public long decrement(String key) {
        Long value = redisTemplate.opsForValue().decrement(key);
        return value != null ? value : 0;
    }

    // ==================== Rate Limiting ====================

    /**
     * Check if request is allowed based on rate limit.
     * 
     * @param identifier Client identifier (IP, user ID, etc.)
     * @param endpoint   API endpoint
     * @param maxRequests Maximum requests allowed
     * @param windowSeconds Time window in seconds
     * @return true if request is allowed
     */
    public boolean isAllowed(String identifier, String endpoint, int maxRequests, long windowSeconds) {
        String key = PREFIX_RATE_LIMIT + identifier + ":" + endpoint;
        
        try {
            Long currentCount = stringRedisTemplate.opsForValue().increment(key);
            
            if (currentCount == null) {
                return false;
            }
            
            if (currentCount == 1) {
                stringRedisTemplate.expire(key, windowSeconds, TimeUnit.SECONDS);
            }
            
            return currentCount <= maxRequests;
        } catch (Exception e) {
            log.error("Rate limit check failed: {}", e.getMessage());
            return true; // Allow on error to avoid blocking legitimate requests
        }
    }

    /**
     * Get remaining requests for rate limit.
     */
    public long getRemainingRequests(String identifier, String endpoint, int maxRequests) {
        String key = PREFIX_RATE_LIMIT + identifier + ":" + endpoint;
        String countStr = stringRedisTemplate.opsForValue().get(key);
        
        if (countStr == null) {
            return maxRequests;
        }
        
        long currentCount = Long.parseLong(countStr);
        return Math.max(0, maxRequests - currentCount);
    }

    // ==================== Distributed Locking ====================

    /**
     * Try to acquire a lock.
     * 
     * @param key        Lock key
     * @param ttl        Lock TTL
     * @return Lock token if acquired, null otherwise
     */
    public String tryLock(String key, Duration ttl) {
        String token = UUID.randomUUID().toString();
        Boolean acquired = redisTemplate.opsForValue()
                .setIfAbsent(PREFIX_LOCK + key, token, ttl);
        
        if (Boolean.TRUE.equals(acquired)) {
            return token;
        }
        return null;
    }

    /**
     * Release a lock.
     * 
     * @param key   Lock key
     * @param token Lock token
     * @return true if released
     */
    public boolean releaseLock(String key, String token) {
        String currentToken = (String) redisTemplate.opsForValue().get(PREFIX_LOCK + key);
        
        if (token.equals(currentToken)) {
            redisTemplate.delete(PREFIX_LOCK + key);
            return true;
        }
        return false;
    }

    // ==================== User Session ====================

    public void storeSession(String sessionId, Map<String, Object> sessionData, Duration ttl) {
        String key = PREFIX_SESSION + sessionId;
        redisTemplate.opsForHash().putAll(key, sessionData);
        redisTemplate.expire(key, ttl);
    }

    public Map<Object, Object> getSession(String sessionId) {
        return redisTemplate.opsForHash().entries(PREFIX_SESSION + sessionId);
    }

    public void updateSession(String sessionId, String field, Object value) {
        redisTemplate.opsForHash().put(PREFIX_SESSION + sessionId, field, value);
    }

    public void deleteSession(String sessionId) {
        redisTemplate.delete(PREFIX_SESSION + sessionId);
    }

    public boolean sessionExists(String sessionId) {
        return exists(PREFIX_SESSION + sessionId);
    }

    // ==================== Product Views ====================

    public void recordProductView(String productId, String userId) {
        String key = PREFIX_VIEW + productId;
        increment(key);
        
        if (userId != null) {
            String userViewKey = "user:" + userId + ":viewed_products";
            redisTemplate.opsForSet().add(userViewKey, productId);
            expire(userViewKey, Duration.ofDays(30));
        }
    }

    public long getProductViewCount(String productId) {
        String count = stringRedisTemplate.opsForValue().get(PREFIX_VIEW + productId);
        return count != null ? Long.parseLong(count) : 0;
    }

    public Set<Object> getRecentlyViewedProducts(String userId, int limit) {
        String key = "user:" + userId + ":viewed_products";
        return redisTemplate.opsForSet().distinctRandomMembers(key, limit);
    }

    // ==================== AI Recommendations Cache ====================

    public void cacheAIRecommendations(String userId, List<String> productIds, Duration ttl) {
        String key = PREFIX_AI + "recommendations:" + userId;
        redisTemplate.opsForList().rightPushAll(key, productIds);
        redisTemplate.expire(key, ttl);
    }

    public List<Object> getAIRecommendations(String userId) {
        String key = PREFIX_AI + "recommendations:" + userId;
        return redisTemplate.opsForList().range(key, 0, -1);
    }

    public void cacheAIContext(String sessionId, Object context, Duration ttl) {
        set(PREFIX_AI + "context:" + sessionId, context, ttl);
    }

    public <T> T getAIContext(String sessionId, Class<T> type) {
        return get(PREFIX_AI + "context:" + sessionId, type);
    }

    // ==================== Shopping Cart ====================

    public void cacheCart(String userId, Map<String, Object> cartData, Duration ttl) {
        String key = PREFIX_CART + userId;
        redisTemplate.opsForHash().putAll(key, cartData);
        redisTemplate.expire(key, ttl);
    }

    public Map<Object, Object> getCart(String userId) {
        return redisTemplate.opsForHash().entries(PREFIX_CART + userId);
    }

    public void addToCart(String userId, String productId, int quantity) {
        String key = PREFIX_CART + userId;
        redisTemplate.opsForHash().increment(key, productId, quantity);
    }

    public void removeFromCart(String userId, String productId) {
        redisTemplate.opsForHash().delete(PREFIX_CART + userId, productId);
    }

    public void clearCart(String userId) {
        delete(PREFIX_CART + userId);
    }
}
