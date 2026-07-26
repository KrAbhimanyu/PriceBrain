package com.pricebrain.shared.repository;

import com.pricebrain.shared.model.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Order entity operations.
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, UUID>, JpaSpecificationExecutor<Order> {

    /**
     * Find order by order number.
     */
    Optional<Order> findByOrderNumber(String orderNumber);

    /**
     * Check if order number exists.
     */
    boolean existsByOrderNumber(String orderNumber);

    /**
     * Find orders by user.
     */
    Page<Order> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    /**
     * Find orders by seller.
     */
    Page<Order> findBySellerIdOrderByCreatedAtDesc(UUID sellerId, Pageable pageable);

    /**
     * Find orders by status.
     */
    Page<Order> findByStatus(Order.OrderStatus status, Pageable pageable);

    /**
     * Find orders by status for a user.
     */
    Page<Order> findByUserIdAndStatus(UUID userId, Order.OrderStatus status, Pageable pageable);

    /**
     * Find orders by payment status.
     */
    Page<Order> findByPaymentStatus(Order.PaymentStatus paymentStatus, Pageable pageable);

    /**
     * Find orders created between dates.
     */
    @Query("SELECT o FROM Order o WHERE o.createdAt BETWEEN :startDate AND :endDate")
    List<Order> findByDateRange(@Param("startDate") Instant startDate, @Param("endDate") Instant endDate);

    /**
     * Find orders for a specific day.
     */
    List<Order> findByCreatedAtBetween(Instant startOfDay, Instant endOfDay);

    /**
     * Calculate total revenue for a date range.
     */
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE " +
           "o.createdAt BETWEEN :startDate AND :endDate AND o.paymentStatus = 'PAID'")
    BigDecimal calculateRevenue(@Param("startDate") Instant startDate, @Param("endDate") Instant endDate);

    /**
     * Count orders by status.
     */
    long countByStatus(Order.OrderStatus status);

    /**
     * Count orders by status for seller.
     */
    long countBySellerIdAndStatus(UUID sellerId, Order.OrderStatus status);

    /**
     * Count orders by user.
     */
    long countByUserId(UUID userId);

    /**
     * Find pending orders for processing.
     */
    @Query("SELECT o FROM Order o WHERE o.status = 'PENDING' ORDER BY o.createdAt ASC")
    List<Order> findPendingOrders(Pageable pageable);

    /**
     * Find shipped orders for tracking.
     */
    List<Order> findByStatusIn(List<Order.OrderStatus> statuses);

    /**
     * Update order status.
     */
    @Modifying
    @Query("UPDATE Order o SET o.status = :status, o.updatedAt = CURRENT_TIMESTAMP WHERE o.id = :orderId")
    void updateStatus(@Param("orderId") UUID orderId, @Param("status") Order.OrderStatus status);

    /**
     * Update payment status.
     */
    @Modifying
    @Query("UPDATE Order o SET o.paymentStatus = :status, o.updatedAt = CURRENT_TIMESTAMP WHERE o.id = :orderId")
    void updatePaymentStatus(@Param("orderId") UUID orderId, @Param("status") Order.PaymentStatus status);

    /**
     * Find orders needing delivery update.
     */
    @Query("SELECT o FROM Order o WHERE o.status = 'SHIPPED' AND o.estimatedDelivery < :date")
    List<Order> findOrdersNeedingDeliveryUpdate(@Param("date") LocalDate date);

    /**
     * Get monthly order statistics.
     */
    @Query("SELECT COUNT(o), COALESCE(SUM(o.totalAmount), 0) FROM Order o " +
           "WHERE o.createdAt >= :startDate AND o.paymentStatus = 'PAID'")
    Object[] getMonthlyStats(@Param("startDate") Instant startDate);

    /**
     * Find user orders with filters.
     */
    @Query("SELECT o FROM Order o WHERE o.userId = :userId AND " +
           "(:status IS NULL OR o.status = :status) AND " +
           "(:startDate IS NULL OR o.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR o.createdAt <= :endDate) " +
           "ORDER BY o.createdAt DESC")
    Page<Order> findUserOrdersWithFilters(
            @Param("userId") UUID userId,
            @Param("status") Order.OrderStatus status,
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate,
            Pageable pageable);

    /**
     * Find cancelled orders for refund processing.
     */
    List<Order> findByStatusAndPaymentStatus(Order.OrderStatus status, Order.PaymentStatus paymentStatus);

    /**
     * Get recent orders for seller dashboard.
     */
    @Query("SELECT o FROM Order o WHERE o.sellerId = :sellerId ORDER BY o.createdAt DESC")
    List<Order> findRecentOrdersForSeller(@Param("sellerId") UUID sellerId, Pageable pageable);
}
