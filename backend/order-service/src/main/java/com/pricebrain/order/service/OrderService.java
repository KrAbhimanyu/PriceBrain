package com.pricebrain.order.service;

import com.pricebrain.order.controller.OrderController.*;
import com.pricebrain.shared.api.ErrorCodes;
import com.pricebrain.shared.model.Order;
import com.pricebrain.shared.model.Order.OrderStatus;
import com.pricebrain.shared.model.Order.PaymentStatus;
import com.pricebrain.shared.model.OrderItem;
import com.pricebrain.shared.repository.OrderRepository;
import com.pricebrain.shared.repository.ProductRepository;
import com.pricebrain.shared.service.RedisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Order service implementing business logic for order operations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final RedisService redisService;

    // Order status flow
    private static final List<OrderStatus> CANCELLABLE_STATUSES = 
            List.of(OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PROCESSING);
    private static final List<OrderStatus> RETURNABLE_STATUSES = 
            List.of(OrderStatus.DELIVERED);

    /**
     * Get all orders for a user with pagination.
     */
    @Transactional(readOnly = true)
    public Page<OrderSummaryDTO> getOrders(UUID userId, OrderStatus status, 
                                           LocalDate startDate, LocalDate endDate,
                                           Pageable pageable) {
        log.info("Getting orders for user: {}, status: {}", userId, status);

        Page<Order> orders;

        if (status != null) {
            orders = orderRepository.findByUserIdAndStatus(userId, status, pageable);
        } else {
            orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        }

        return orders.map(this::toOrderSummary);
    }

    /**
     * Get order by ID.
     */
    @Transactional(readOnly = true)
    public OrderDTO getOrderById(UUID orderId, UUID userId) {
        log.info("Getting order: {} for user: {}", orderId, userId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderException(ErrorCodes.ORDER_001));

        // Verify ownership
        if (!order.getUserId().equals(userId)) {
            throw new OrderException(ErrorCodes.AUTHZ_004);
        }

        return toOrderDTO(order);
    }

    /**
     * Get order by order number.
     */
    @Transactional(readOnly = true)
    public OrderDTO getOrderByNumber(String orderNumber, UUID userId) {
        log.info("Getting order by number: {}", orderNumber);

        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new OrderException(ErrorCodes.ORDER_001));

        // Verify ownership
        if (!order.getUserId().equals(userId)) {
            throw new OrderException(ErrorCodes.AUTHZ_004);
        }

        return toOrderDTO(order);
    }

    /**
     * Create a new order.
     */
    @Transactional
    public CreateOrderResponseDTO createOrder(CreateOrderRequest request, UUID userId) {
        log.info("Creating order for user: {}", userId);

        // TODO: Fetch cart items
        // TODO: Validate stock
        // TODO: Calculate totals
        // TODO: Apply coupon

        // Generate order number
        String orderNumber = generateOrderNumber();

        // Create order
        Order order = Order.builder()
                .orderNumber(orderNumber)
                .userId(userId)
                .shippingAddressId(request.getShippingAddressId())
                .billingAddressId(request.getBillingAddressId())
                .paymentMethod(request.getPaymentMethod())
                .couponCode(request.getCouponCode())
                .notes(request.getNotes())
                .status(OrderStatus.PENDING)
                .paymentStatus(PaymentStatus.PENDING)
                .itemsCount(0)
                .subtotal(BigDecimal.ZERO)
                .discountAmount(BigDecimal.ZERO)
                .shippingCharge(BigDecimal.ZERO)
                .taxAmount(BigDecimal.ZERO)
                .totalAmount(BigDecimal.ZERO)
                .build();

        order = orderRepository.save(order);
        log.info("Order created: {} with number: {}", order.getId(), orderNumber);

        // TODO: Create order items
        // TODO: Reserve inventory
        // TODO: Initiate payment

        return CreateOrderResponseDTO.builder()
                .orderId(order.getId())
                .orderNumber(orderNumber)
                .totalAmount(order.getTotalAmount())
                .paymentRequired(true)
                .paymentIntentId("pi-" + UUID.randomUUID()) // Placeholder
                .build();
    }

    /**
     * Cancel an order.
     */
    @Transactional
    public OrderDTO cancelOrder(UUID orderId, CancelOrderRequest request, UUID userId) {
        log.info("Cancelling order: {} for user: {}, reason: {}", orderId, userId, request.getReason());

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderException(ErrorCodes.ORDER_001));

        // Verify ownership
        if (!order.getUserId().equals(userId)) {
            throw new OrderException(ErrorCodes.AUTHZ_004);
        }

        // Check if cancellable
        if (!CANCELLABLE_STATUSES.contains(order.getStatus())) {
            throw new OrderException(ErrorCodes.ORDER_006);
        }

        // Update status
        order.setStatus(OrderStatus.CANCELLED);
        order.setNotes(request.getComment());

        // If payment was made, initiate refund
        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            // TODO: Initiate refund
            order.setPaymentStatus(PaymentStatus.REFUNDED);
        }

        order = orderRepository.save(order);
        log.info("Order cancelled: {}", orderId);

        // TODO: Release inventory reservation
        // TODO: Send cancellation notification

        return toOrderDTO(order);
    }

    /**
     * Request a return.
     */
    @Transactional
    public ReturnRequestDTO requestReturn(UUID orderId, ReturnRequest request, UUID userId) {
        log.info("Return request for order: {}, reason: {}", orderId, request.getReason());

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderException(ErrorCodes.ORDER_001));

        // Verify ownership
        if (!order.getUserId().equals(userId)) {
            throw new OrderException(ErrorCodes.AUTHZ_004);
        }

        // Check if delivered
        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new OrderException(ErrorCodes.ORDER_011);
        }

        // Check return window (7 days)
        if (order.getActualDeliveryDate() != null) {
            LocalDate deliveryDate = order.getActualDeliveryDate()
                    .atZone(java.time.ZoneId.systemDefault()).toLocalDate();
            if (deliveryDate.plusDays(7).isBefore(LocalDate.now())) {
                throw new OrderException(ErrorCodes.ORDER_011);
            }
        }

        // TODO: Create return record
        // TODO: Schedule pickup
        // TODO: Calculate refund amount

        UUID returnId = UUID.randomUUID();

        return ReturnRequestDTO.builder()
                .returnId(returnId)
                .orderId(orderId)
                .status("PICKUP_SCHEDULED")
                .refundAmount(BigDecimal.valueOf(999.00)) // Placeholder
                .pickupDate(LocalDate.now().plusDays(2))
                .build();
    }

    /**
     * Get order tracking information.
     */
    @Transactional(readOnly = true)
    public TrackingDTO getTracking(UUID orderId, UUID userId) {
        log.info("Getting tracking for order: {}", orderId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderException(ErrorCodes.ORDER_001));

        // Verify ownership
        if (!order.getUserId().equals(userId)) {
            throw new OrderException(ErrorCodes.AUTHZ_004);
        }

        // Build tracking info
        // TODO: Fetch actual tracking from shipment service
        return TrackingDTO.builder()
                .orderId(orderId)
                .trackingNumber("TRK" + orderId.toString().substring(0, 8).toUpperCase())
                .carrier("Delhivery")
                .status(order.getStatus().name())
                .estimatedDelivery(order.getEstimatedDelivery())
                .events(List.of(
                        TrackingEventDTO.builder()
                                .status("ORDER_PLACED")
                                .description("Order placed successfully")
                                .location("Online")
                                .timestamp(order.getCreatedAt())
                                .build()
                ))
                .build();
    }

    /**
     * Get order statistics for a user.
     */
    @Transactional(readOnly = true)
    public OrderStatsDTO getOrderStats(UUID userId, String period) {
        log.info("Getting order stats for user: {}, period: {}", userId, period);

        // Calculate date range based on period
        LocalDate startDate = switch (period.toLowerCase()) {
            case "week" -> LocalDate.now().minusWeeks(1);
            case "year" -> LocalDate.now().minusYears(1);
            default -> LocalDate.now().minusMonths(1);
        };

        Instant start = startDate.atStartOfDay(java.time.ZoneId.systemDefault()).toInstant();

        // Get orders
        List<Order> orders = orderRepository.findByDateRange(start, Instant.now());

        // Calculate statistics
        int totalOrders = orders.size();
        BigDecimal totalSpent = orders.stream()
                .filter(o -> o.getPaymentStatus() == PaymentStatus.PAID)
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal avgOrderValue = totalOrders > 0 
                ? totalSpent.divide(BigDecimal.valueOf(totalOrders), 2, BigDecimal.ROUND_HALF_UP)
                : BigDecimal.ZERO;

        long pending = orders.stream().filter(o -> o.getStatus() == OrderStatus.PENDING).count();
        long delivered = orders.stream().filter(o -> o.getStatus() == OrderStatus.DELIVERED).count();
        long cancelled = orders.stream().filter(o -> o.getStatus() == OrderStatus.CANCELLED).count();

        return OrderStatsDTO.builder()
                .totalOrders(totalOrders)
                .totalSpent(totalSpent)
                .averageOrderValue(avgOrderValue)
                .pendingOrders((int) pending)
                .deliveredOrders((int) delivered)
                .cancelledOrders((int) cancelled)
                .returnRequests(0) // TODO: Calculate
                .build();
    }

    /**
     * Generate unique order number.
     */
    private String generateOrderNumber() {
        return "PB-" + java.time.Year.now().getValue() + "-" + 
               String.format("%06d", (int)(Math.random() * 1000000));
    }

    /**
     * Convert Order entity to DTO.
     */
    private OrderDTO toOrderDTO(Order order) {
        return OrderDTO.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .userId(order.getUserId())
                .sellerId(order.getSellerId())
                .status(order.getStatus().name())
                .itemsCount(order.getItemsCount())
                .subtotal(order.getSubtotal())
                .discountAmount(order.getDiscountAmount())
                .couponCode(order.getCouponCode())
                .shippingCharge(order.getShippingCharge())
                .taxAmount(order.getTaxAmount())
                .totalAmount(order.getTotalAmount())
                .currency(order.getCurrency())
                .paymentStatus(order.getPaymentStatus().name())
                .paymentMethod(order.getPaymentMethod())
                .estimatedDelivery(order.getEstimatedDelivery())
                .deliveredAt(order.getActualDeliveryDate())
                .notes(order.getNotes())
                .aiRecommendationUsed(order.getAiRecommendationUsed())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    /**
     * Convert Order entity to summary DTO.
     */
    private OrderSummaryDTO toOrderSummary(Order order) {
        return OrderSummaryDTO.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .status(order.getStatus().name())
                .itemsCount(order.getItemsCount())
                .totalAmount(order.getTotalAmount())
                .paymentStatus(order.getPaymentStatus().name())
                .createdAt(order.getCreatedAt())
                .deliveredAt(order.getActualDeliveryDate())
                .build();
    }

    /**
     * Custom order exception.
     */
    public static class OrderException extends RuntimeException {
        private final ErrorCodes errorCode;

        public OrderException(ErrorCodes errorCode) {
            super(errorCode.getDefaultMessage());
            this.errorCode = errorCode;
        }

        public ErrorCodes getErrorCode() {
            return errorCode;
        }
    }
}
