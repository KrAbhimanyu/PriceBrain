package com.pricebrain.order.controller;

import com.pricebrain.order.dto.OrderDTOs.*;
import com.pricebrain.shared.api.ApiResponse;
import com.pricebrain.shared.api.BaseController;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse as SwgResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Order API endpoints.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Order Management APIs")
@SecurityRequirement(name = "bearerAuth")
public class OrderController extends BaseController {

    // ==================== ORDER CRUD ====================

    @Operation(
            summary = "Get user orders",
            description = """
                    Retrieve paginated list of orders for the authenticated user.
                    
                    **Filters:**
                    - Status (PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, RETURNED)
                    - Date range
                    - Payment status
                    """
    )
    @ApiResponses({
            @SwgResponse(responseCode = "200", description = "Orders retrieved successfully"),
            @SwgResponse(responseCode = "401", description = "Not authenticated")
    })
    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<OrderSummaryDTO>>> getOrders(
            @Parameter(description = "User ID")
            @RequestHeader("X-User-ID") UUID userId,
            
            @Parameter(description = "Order status filter")
            @RequestParam(required = false) String status,
            
            @Parameter(description = "Start date (YYYY-MM-DD)")
            @RequestParam(required = false) LocalDate startDate,
            
            @Parameter(description = "End date (YYYY-MM-DD)")
            @RequestParam(required = false) LocalDate endDate,
            
            @Parameter(description = "Page number")
            @RequestParam(defaultValue = "0") int page,
            
            @Parameter(description = "Page size")
            @RequestParam(defaultValue = "20") int size) {

        log.info("Get orders for user: {}, status: {}", userId, status);

        // TODO: Implement get orders
        OrderSummaryDTO order = OrderSummaryDTO.builder()
                .id(UUID.randomUUID())
                .orderNumber("PB-2024-001234")
                .status("DELIVERED")
                .itemsCount(3)
                .totalAmount(BigDecimal.valueOf(2999.00))
                .paymentStatus("PAID")
                .createdAt(LocalDateTime.now().minusDays(5))
                .build();

        return success(new PagedResponse<>(List.of(order), page, size, 1, 1, true, true, 1, "createdAt"));
    }

    @Operation(summary = "Get order by ID")
    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<OrderDTO>> getOrder(
            @Parameter(description = "Order ID") @PathVariable UUID orderId,
            @Parameter(description = "User ID") @RequestHeader("X-User-ID") UUID userId) {

        log.info("Get order: {} for user: {}", orderId, userId);

        // TODO: Implement get order by ID
        OrderDTO order = OrderDTO.builder()
                .id(orderId)
                .orderNumber("PB-2024-001234")
                .userId(userId)
                .status("DELIVERED")
                .itemsCount(3)
                .subtotal(BigDecimal.valueOf(2500.00))
                .discountAmount(BigDecimal.valueOf(100.00))
                .shippingCharge(BigDecimal.valueOf(49.00))
                .taxAmount(BigDecimal.valueOf(450.00))
                .totalAmount(BigDecimal.valueOf(2999.00))
                .paymentStatus("PAID")
                .paymentMethod("CARD")
                .createdAt(LocalDateTime.now().minusDays(5))
                .deliveredAt(LocalDateTime.now().minusDays(2))
                .build();

        return success(order);
    }

    @Operation(summary = "Get order by order number")
    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<ApiResponse<OrderDTO>> getOrderByNumber(
            @Parameter(description = "Order number") @PathVariable String orderNumber,
            @Parameter(description = "User ID") @RequestHeader("X-User-ID") UUID userId) {

        log.info("Get order by number: {}", orderNumber);

        // TODO: Implement get order by number
        OrderDTO order = OrderDTO.builder()
                .id(UUID.randomUUID())
                .orderNumber(orderNumber)
                .status("DELIVERED")
                .totalAmount(BigDecimal.valueOf(2999.00))
                .build();

        return success(order);
    }

    // ==================== CREATE ORDER ====================

    @Operation(
            summary = "Create order",
            description = """
                    Create a new order from the user's cart.
                    
                    **Steps:**
                    1. Validate cart items and prices
                    2. Apply coupons/discounts
                    3. Calculate totals
                    4. Create order
                    5. Initiate payment
                    
                    **Idempotency:**
                    Use `X-Idempotency-Key` header to prevent duplicate orders.
                    """
    )
    @ApiResponses({
            @SwgResponse(responseCode = "201", description = "Order created successfully"),
            @SwgResponse(responseCode = "400", description = "Invalid order data"),
            @SwgResponse(responseCode = "409", description = "Order already exists (idempotency)")
    })
    @PostMapping
    public ResponseEntity<ApiResponse<CreateOrderResponseDTO>> createOrder(
            @Valid @RequestBody CreateOrderRequest request,
            @Parameter(description = "User ID") @RequestHeader("X-User-ID") UUID userId,
            @Parameter(description = "Idempotency key")
            @RequestHeader(value = "X-Idempotency-Key", required = false) String idempotencyKey) {

        log.info("Create order for user: {}, idempotency: {}", userId, idempotencyKey);

        // TODO: Implement order creation
        CreateOrderResponseDTO response = CreateOrderResponseDTO.builder()
                .orderId(UUID.randomUUID())
                .orderNumber("PB-2024-001235")
                .totalAmount(BigDecimal.valueOf(2999.00))
                .paymentRequired(true)
                .paymentIntentId("pi_xxx")
                .build();

        return created(response, "Order created successfully");
    }

    // ==================== CANCEL ORDER ====================

    @Operation(
            summary = "Cancel order",
            description = """
                    Cancel an order before it's shipped.
                    
                    **Cancellation Reasons:**
                    - `CHANGE_OF_MIND`
                    - `WRONG_ITEM`
                    - `ORDERED_BY_MISTAKE`
                    - `OTHER`
                    
                    **Note:** Orders can only be cancelled if status is PENDING, CONFIRMED, or PROCESSING.
                    """
    )
    @ApiResponses({
            @SwgResponse(responseCode = "200", description = "Order cancelled successfully"),
            @SwgResponse(responseCode = "400", description = "Order cannot be cancelled"),
            @SwgResponse(responseCode = "404", description = "Order not found")
    })
    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<ApiResponse<OrderDTO>> cancelOrder(
            @Parameter(description = "Order ID") @PathVariable UUID orderId,
            @Valid @RequestBody CancelOrderRequest request,
            @Parameter(description = "User ID") @RequestHeader("X-User-ID") UUID userId) {

        log.info("Cancel order: {} for user: {}, reason: {}", orderId, userId, request.getReason());

        // TODO: Implement order cancellation
        OrderDTO order = OrderDTO.builder()
                .id(orderId)
                .status("CANCELLED")
                .build();

        return success(order, "Order cancelled successfully");
    }

    // ==================== RETURN ORDER ====================

    @Operation(
            summary = "Request return",
            description = """
                    Request a return for delivered order items.
                    
                    **Return Reasons:**
                    - `DEFECTIVE`
                    - `WRONG_ITEM`
                    - `NOT_AS_DESCRIBED`
                    - `CHANGED_MIND`
                    - `OTHER`
                    
                    **Window:** Returns can be requested within 7 days of delivery.
                    """
    )
    @ApiResponses({
            @SwgResponse(responseCode = "201", description = "Return requested successfully"),
            @SwgResponse(responseCode = "400", description = "Return window expired or invalid"),
            @SwgResponse(responseCode = "404", description = "Order not found")
    })
    @PostMapping("/{orderId}/return")
    public ResponseEntity<ApiResponse<ReturnRequestDTO>> requestReturn(
            @Parameter(description = "Order ID") @PathVariable UUID orderId,
            @Valid @RequestBody ReturnRequest request,
            @Parameter(description = "User ID") @RequestHeader("X-User-ID") UUID userId) {

        log.info("Return request for order: {}, reason: {}", orderId, request.getReason());

        // TODO: Implement return request
        ReturnRequestDTO response = ReturnRequestDTO.builder()
                .returnId(UUID.randomUUID())
                .orderId(orderId)
                .status("PICKUP_SCHEDULED")
                .refundAmount(BigDecimal.valueOf(999.00))
                .pickupDate(LocalDate.now().plusDays(2))
                .build();

        return created(response, "Return requested successfully");
    }

    // ==================== ORDER ITEMS ====================

    @Operation(summary = "Get order items")
    @GetMapping("/{orderId}/items")
    public ResponseEntity<ApiResponse<List<OrderItemDTO>>> getOrderItems(
            @Parameter(description = "Order ID") @PathVariable UUID orderId,
            @Parameter(description = "User ID") @RequestHeader("X-User-ID") UUID userId) {

        log.info("Get items for order: {}", orderId);

        // TODO: Implement get order items
        return success(List.of());
    }

    // ==================== SHIPMENT TRACKING ====================

    @Operation(summary = "Track shipment")
    @GetMapping("/{orderId}/tracking")
    public ResponseEntity<ApiResponse<TrackingDTO>> trackShipment(
            @Parameter(description = "Order ID") @PathVariable UUID orderId,
            @Parameter(description = "User ID") @RequestHeader("X-User-ID") UUID userId) {

        log.info("Track shipment for order: {}", orderId);

        // TODO: Implement shipment tracking
        TrackingDTO tracking = TrackingDTO.builder()
                .orderId(orderId)
                .trackingNumber("TRK123456789")
                .carrier("Delhivery")
                .status("IN_TRANSIT")
                .estimatedDelivery(LocalDate.now().plusDays(2))
                .events(List.of(
                        TrackingEventDTO.builder()
                                .status("PICKED_UP")
                                .location("Mumbai, MH")
                                .timestamp(LocalDateTime.now().minusDays(1))
                                .build()
                ))
                .build();

        return success(tracking);
    }

    // ==================== SELLER ORDERS ====================

    @Operation(
            summary = "Get seller orders",
            description = "Get orders for seller dashboard (Seller role required)"
    )
    @GetMapping("/seller")
    public ResponseEntity<ApiResponse<PagedResponse<SellerOrderDTO>>> getSellerOrders(
            @Parameter(description = "User ID") @RequestHeader("X-User-ID") UUID userId,
            @Parameter(description = "Order status")
            @RequestParam(required = false) String status,
            @Parameter(description = "Page number")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size")
            @RequestParam(defaultValue = "20") int size) {

        log.info("Get seller orders for user: {}", userId);

        // TODO: Implement get seller orders
        return success(new PagedResponse<>(List.of(), page, size, 0, 0, true, true, 0, "createdAt"));
    }

    @Operation(summary = "Update order status (Seller)")
    @PutMapping("/{orderId}/status")
    public ResponseEntity<ApiResponse<OrderDTO>> updateOrderStatus(
            @Parameter(description = "Order ID") @PathVariable UUID orderId,
            @Valid @RequestBody UpdateOrderStatusRequest request,
            @Parameter(description = "User ID") @RequestHeader("X-User-ID") UUID userId) {

        log.info("Update order status: {} to {}", orderId, request.getStatus());

        // TODO: Implement status update
        OrderDTO order = OrderDTO.builder()
                .id(orderId)
                .status(request.getStatus())
                .build();

        return success(order, "Order status updated");
    }

    // ==================== ORDER STATISTICS ====================

    @Operation(summary = "Get order statistics")
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<OrderStatsDTO>> getOrderStats(
            @Parameter(description = "User ID") @RequestHeader("X-User-ID") UUID userId,
            @Parameter(description = "Period (week/month/year)")
            @RequestParam(defaultValue = "month") String period) {

        log.info("Get order stats for user: {}, period: {}", userId, period);

        // TODO: Implement stats
        OrderStatsDTO stats = OrderStatsDTO.builder()
                .totalOrders(45)
                .totalSpent(BigDecimal.valueOf(125000.00))
                .averageOrderValue(BigDecimal.valueOf(2777.78))
                .pendingOrders(2)
                .deliveredOrders(40)
                .cancelledOrders(3)
                .returnRequests(2)
                .build();

        return success(stats);
    }

    // ==================== DTOs ====================

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Order summary for listings")
    public static class OrderSummaryDTO {
        private UUID id;
        private String orderNumber;
        private String status;
        private Integer itemsCount;
        private BigDecimal totalAmount;
        private String paymentStatus;
        private LocalDateTime createdAt;
        private LocalDateTime deliveredAt;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Full order details")
    public static class OrderDTO {
        private UUID id;
        private String orderNumber;
        private UUID userId;
        private UUID sellerId;
        private String status;
        private Integer itemsCount;
        private BigDecimal subtotal;
        private BigDecimal discountAmount;
        private String couponCode;
        private BigDecimal shippingCharge;
        private BigDecimal taxAmount;
        private BigDecimal totalAmount;
        private String currency;
        private String paymentStatus;
        private String paymentMethod;
        private AddressDTO shippingAddress;
        private AddressDTO billingAddress;
        private List<OrderItemDTO> items;
        private List<ShipmentDTO> shipments;
        private LocalDate estimatedDelivery;
        private LocalDateTime deliveredAt;
        private String notes;
        private Boolean aiRecommendationUsed;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Create order request")
    public static class CreateOrderRequest {
        @Schema(description = "Shipping address ID")
        private UUID shippingAddressId;
        
        @Schema(description = "Billing address ID")
        private UUID billingAddressId;
        
        @Schema(description = "Payment method")
        private String paymentMethod;
        
        @Schema(description = "Coupon code")
        private String couponCode;
        
        @Schema(description = "Order notes")
        private String notes;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Create order response")
    public static class CreateOrderResponseDTO {
        private UUID orderId;
        private String orderNumber;
        private BigDecimal totalAmount;
        private Boolean paymentRequired;
        private String paymentIntentId;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Cancel order request")
    public static class CancelOrderRequest {
        @Schema(description = "Cancellation reason", example = "CHANGE_OF_MIND")
        private String reason;
        
        @Schema(description = "Additional details")
        private String comment;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Order item")
    public static class OrderItemDTO {
        private UUID id;
        private UUID productId;
        private String productName;
        private String productImage;
        private UUID variantId;
        private String variantName;
        private String sku;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal discountPercent;
        private BigDecimal totalAmount;
        private String itemStatus;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Address")
    public static class AddressDTO {
        private UUID id;
        private String recipientName;
        private String phone;
        private String addressLine1;
        private String addressLine2;
        private String landmark;
        private String city;
        private String state;
        private String postalCode;
        private String country;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Shipment")
    public static class ShipmentDTO {
        private UUID id;
        private String trackingNumber;
        private String carrier;
        private String status;
        private LocalDate estimatedDelivery;
        private LocalDateTime shippedAt;
        private LocalDateTime deliveredAt;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Return request")
    public static class ReturnRequest {
        @Schema(description = "Order item ID")
        private UUID orderItemId;
        
        @Schema(description = "Return reason", example = "DEFECTIVE")
        private String reason;
        
        @Schema(description = "Additional details")
        private String description;
        
        @Schema(description = "Pickup address ID")
        private UUID pickupAddressId;
        
        @Schema(description = "Requested pickup date")
        private LocalDate pickupDate;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Return request response")
    public static class ReturnRequestDTO {
        private UUID returnId;
        private UUID orderId;
        private String status;
        private BigDecimal refundAmount;
        private LocalDate pickupDate;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Tracking information")
    public static class TrackingDTO {
        private UUID orderId;
        private String trackingNumber;
        private String carrier;
        private String status;
        private LocalDate estimatedDelivery;
        private List<TrackingEventDTO> events;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Tracking event")
    public static class TrackingEventDTO {
        private String status;
        private String description;
        private String location;
        private LocalDateTime timestamp;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Seller order summary")
    public static class SellerOrderDTO {
        private UUID id;
        private String orderNumber;
        private UUID buyerId;
        private String buyerName;
        private Integer itemsCount;
        private BigDecimal totalAmount;
        private String status;
        private LocalDateTime createdAt;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Update order status request")
    public static class UpdateOrderStatusRequest {
        @Schema(description = "New status")
        private String status;
        
        @Schema(description = "Optional notes")
        private String notes;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Order statistics")
    public static class OrderStatsDTO {
        private Integer totalOrders;
        private BigDecimal totalSpent;
        private BigDecimal averageOrderValue;
        private Integer pendingOrders;
        private Integer processingOrders;
        private Integer shippedOrders;
        private Integer deliveredOrders;
        private Integer cancelledOrders;
        private Integer returnRequests;
    }
}
