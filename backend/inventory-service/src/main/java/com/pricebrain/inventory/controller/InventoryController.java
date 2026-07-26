package com.pricebrain.inventory.controller;

import com.pricebrain.inventory.dto.InventoryDTOs.*;
import com.pricebrain.shared.api.ApiResponse;
import com.pricebrain.shared.api.BaseController;
import com.pricebrain.inventory.service.InventoryService;
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

import java.util.List;
import java.util.UUID;

/**
 * Inventory API endpoints for stock management.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
@Tag(name = "Inventory", description = "Inventory Management APIs")
@SecurityRequirement(name = "bearerAuth")
public class InventoryController extends BaseController {

    private final InventoryService inventoryService;

    @Operation(summary = "Get inventory for product")
    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<InventoryDTO>> getProductInventory(
            @PathVariable UUID productId) {

        log.info("Get inventory for product: {}", productId);
        InventoryDTO inventory = inventoryService.getInventory(productId);
        return success(inventory);
    }

    @Operation(summary = "Get low stock products")
    @GetMapping("/low-stock")
    @ApiResponses({
            @SwgResponse(responseCode = "200", description = "Low stock products")
    })
    public ResponseEntity<ApiResponse<List<LowStockDTO>>> getLowStockProducts(
            @Parameter(description = "Seller ID")
            @RequestHeader(value = "X-Seller-ID", required = false) UUID sellerId,
            @Parameter(description = "Threshold")
            @RequestParam(defaultValue = "10") int threshold,
            @Parameter(description = "Limit")
            @RequestParam(defaultValue = "50") int limit) {

        log.info("Get low stock products, threshold: {}", threshold);
        List<LowStockDTO> products = inventoryService.getLowStockProducts(sellerId, threshold, limit);
        return success(products);
    }

    @Operation(summary = "Update stock")
    @PutMapping("/product/{productId}/stock")
    public ResponseEntity<ApiResponse<InventoryDTO>> updateStock(
            @PathVariable UUID productId,
            @Valid @RequestBody UpdateStockRequest request) {

        log.info("Update stock for product: {}, quantity: {}", productId, request.getQuantity());
        InventoryDTO inventory = inventoryService.updateStock(productId, request);
        return success(inventory, "Stock updated successfully");
    }

    @Operation(summary = "Reserve stock (for orders)")
    @PostMapping("/product/{productId}/reserve")
    @ApiResponses({
            @SwgResponse(responseCode = "200", description = "Stock reserved"),
            @SwgResponse(responseCode = "400", description = "Insufficient stock")
    })
    public ResponseEntity<ApiResponse<ReserveStockDTO>> reserveStock(
            @PathVariable UUID productId,
            @Valid @RequestBody ReserveStockRequest request) {

        log.info("Reserve stock for product: {}, quantity: {}", productId, request.getQuantity());
        ReserveStockDTO result = inventoryService.reserveStock(productId, request);
        return success(result);
    }

    @Operation(summary = "Release reserved stock")
    @PostMapping("/product/{productId}/release")
    public ResponseEntity<ApiResponse<Void>> releaseStock(
            @PathVariable UUID productId,
            @RequestParam Integer quantity,
            @RequestParam String reservationId) {

        log.info("Release stock for product: {}, quantity: {}", productId, quantity);
        inventoryService.releaseStock(productId, quantity, reservationId);
        return success("Stock released successfully");
    }

    @Operation(summary = "Confirm stock deduction")
    @PostMapping("/product/{productId}/confirm")
    public ResponseEntity<ApiResponse<Void>> confirmDeduction(
            @PathVariable UUID productId,
            @RequestParam Integer quantity,
            @RequestParam String reservationId) {

        log.info("Confirm deduction for product: {}, quantity: {}", productId, quantity);
        inventoryService.confirmDeduction(productId, quantity, reservationId);
        return success("Stock deduction confirmed");
    }

    @Operation(summary = "Get stock movements")
    @GetMapping("/product/{productId}/movements")
    public ResponseEntity<ApiResponse<List<StockMovementDTO>>> getStockMovements(
            @PathVariable UUID productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        log.info("Get stock movements for product: {}", productId);
        List<StockMovementDTO> movements = inventoryService.getStockMovements(productId, page, size);
        return success(movements);
    }

    @Operation(summary = "Set stock alert")
    @PutMapping("/product/{productId}/alert")
    public ResponseEntity<ApiResponse<Void>> setStockAlert(
            @PathVariable UUID productId,
            @RequestParam Integer threshold) {

        log.info("Set stock alert for product: {}, threshold: {}", productId, threshold);
        inventoryService.setStockAlert(productId, threshold);
        return success("Stock alert set successfully");
    }

    // ==================== DTOs ====================

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Inventory details")
    public static class InventoryDTO {
        private UUID productId;
        private Integer availableStock;
        private Integer reservedStock;
        private Integer totalStock;
        private Integer lowStockThreshold;
        private Boolean isLowStock;
        private Boolean isOutOfStock;
        private String stockStatus;
        private java.time.Instant lastRestockedAt;
        private java.time.Instant updatedAt;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Low stock product")
    public static class LowStockDTO {
        private UUID productId;
        private String productName;
        private String sku;
        private Integer availableStock;
        private Integer threshold;
        private Integer reorderLevel;
        private String status;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Update stock request")
    public static class UpdateStockRequest {
        private Integer quantity;
        private String reason;
        private String reference;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Reserve stock response")
    public static class ReserveStockDTO {
        private String reservationId;
        private UUID productId;
        private Integer quantity;
        private Integer expiresIn;
        private java.time.Instant expiresAt;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Reserve stock request")
    public static class ReserveStockRequest {
        private Integer quantity;
        private String orderId;
        private Integer expiryMinutes;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @Schema(description = "Stock movement")
    public static class StockMovementDTO {
        private UUID id;
        private UUID productId;
        private String type;
        private Integer quantity;
        private Integer balanceBefore;
        private Integer balanceAfter;
        private String reason;
        private String reference;
        private java.time.Instant createdAt;
    }
}
