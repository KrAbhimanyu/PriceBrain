package com.pricebrain.inventory.service;

import com.pricebrain.inventory.controller.InventoryController.*;
import com.pricebrain.inventory.repository.InventoryRepository;
import com.pricebrain.inventory.repository.StockReservationRepository;
import com.pricebrain.inventory.repository.StockMovementRepository;
import com.pricebrain.shared.api.ErrorCodes;
import com.pricebrain.shared.model.Inventory;
import com.pricebrain.shared.model.Inventory.StockStatus;
import com.pricebrain.shared.model.StockReservation;
import com.pricebrain.shared.model.StockMovement;
import com.pricebrain.shared.model.Product;
import com.pricebrain.shared.repository.ProductRepository;
import com.pricebrain.shared.service.RedisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Inventory service implementing stock management logic.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final StockReservationRepository reservationRepository;
    private final StockMovementRepository movementRepository;
    private final ProductRepository productRepository;
    private final RedisService redisService;

    // ==================== INVENTORY ====================

    /**
     * Get inventory for product.
     */
    @Transactional(readOnly = true)
    public InventoryDTO getInventory(UUID productId) {
        log.info("Getting inventory for product: {}", productId);

        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new InventoryException(ErrorCodes.INV_001));

        return toInventoryDTO(inventory);
    }

    /**
     * Get low stock products.
     */
    @Transactional(readOnly = true)
    public List<LowStockDTO> getLowStockProducts(UUID sellerId, int threshold, int limit) {
        log.info("Getting low stock products, threshold: {}, limit: {}", threshold, limit);

        List<Inventory> inventories = inventoryRepository.findLowStockProducts(threshold, limit);

        return inventories.stream()
                .filter(inv -> {
                    if (sellerId == null) return true;
                    Product product = productRepository.findById(inv.getProductId()).orElse(null);
                    return product != null && product.getSellerId().equals(sellerId);
                })
                .map(this::toLowStockDTO)
                .toList();
    }

    /**
     * Update stock quantity.
     */
    @Transactional
    public InventoryDTO updateStock(UUID productId, UpdateStockRequest request) {
        log.info("Updating stock for product: {}, quantity: {}", productId, request.getQuantity());

        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseGet(() -> createInventory(productId));

        int oldStock = inventory.getAvailableStock();
        int newStock = request.getQuantity();

        inventory.setAvailableStock(newStock);
        inventory.setTotalStock(newStock + inventory.getReservedStock());
        inventory.setLowStockThreshold(inventory.getLowStockThreshold() != null ? inventory.getLowStockThreshold() : 10);
        inventory.setLastRestockedAt(Instant.now());
        inventory = inventoryRepository.save(inventory);

        // Record movement
        recordMovement(productId, "RESTOCK", request.getQuantity() - oldStock, oldStock, newStock, 
                request.getReason(), request.getReference());

        // Update product
        productRepository.findById(productId).ifPresent(product -> {
            product.setStockQuantity(newStock);
            product.setStockStatus(inventory.getStockStatus());
            productRepository.save(product);
        });

        // Clear cache
        redisService.delete("inventory:" + productId);

        log.info("Stock updated for product: {}, old: {}, new: {}", productId, oldStock, newStock);
        return toInventoryDTO(inventory);
    }

    // ==================== RESERVATIONS ====================

    /**
     * Reserve stock for order.
     */
    @Transactional
    public ReserveStockDTO reserveStock(UUID productId, ReserveStockRequest request) {
        log.info("Reserving stock for product: {}, quantity: {}", productId, request.getQuantity());

        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new InventoryException(ErrorCodes.INV_001));

        // Check availability
        if (inventory.getAvailableStock() < request.getQuantity()) {
            throw new InventoryException(ErrorCodes.INV_002);
        }

        // Reserve stock
        int oldAvailable = inventory.getAvailableStock();
        int oldReserved = inventory.getReservedStock();

        inventory.setAvailableStock(oldAvailable - request.getQuantity());
        inventory.setReservedStock(oldReserved + request.getQuantity());
        inventory = inventoryRepository.save(inventory);

        // Create reservation
        String reservationId = UUID.randomUUID().toString();
        int expiryMinutes = request.getExpiryMinutes() != null ? request.getExpiryMinutes() : 30;

        StockReservation reservation = StockReservation.builder()
                .reservationId(reservationId)
                .productId(productId)
                .orderId(request.getOrderId())
                .quantity(request.getQuantity())
                .status("RESERVED")
                .expiresAt(Instant.now().plusSeconds(expiryMinutes * 60L))
                .build();
        reservationRepository.save(reservation);

        // Record movement
        recordMovement(productId, "RESERVE", -request.getQuantity(), oldAvailable, inventory.getAvailableStock(),
                "Stock reserved for order", request.getOrderId());

        // Clear cache
        redisService.delete("inventory:" + productId);

        log.info("Stock reserved for product: {}, quantity: {}, reservation: {}", 
                productId, request.getQuantity(), reservationId);

        return ReserveStockDTO.builder()
                .reservationId(reservationId)
                .productId(productId)
                .quantity(request.getQuantity())
                .expiresIn(expiryMinutes)
                .expiresAt(reservation.getExpiresAt())
                .build();
    }

    /**
     * Release reserved stock (e.g., order cancelled).
     */
    @Transactional
    public void releaseStock(UUID productId, Integer quantity, String reservationId) {
        log.info("Releasing stock for product: {}, quantity: {}, reservation: {}", 
                productId, quantity, reservationId);

        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new InventoryException(ErrorCodes.INV_001));

        // Find reservation
        StockReservation reservation = reservationRepository.findByReservationId(reservationId)
                .orElseThrow(() -> new InventoryException(ErrorCodes.INV_003));

        if (!reservation.getProductId().equals(productId)) {
            throw new InventoryException(ErrorCodes.INV_003);
        }

        // Release stock
        int oldAvailable = inventory.getAvailableStock();
        int oldReserved = inventory.getReservedStock();

        inventory.setAvailableStock(oldAvailable + quantity);
        inventory.setReservedStock(Math.max(0, oldReserved - quantity));
        inventoryRepository.save(inventory);

        // Update reservation
        reservation.setStatus("RELEASED");
        reservationRepository.save(reservation);

        // Record movement
        recordMovement(productId, "RELEASE", quantity, oldAvailable, inventory.getAvailableStock(),
                "Stock released from reservation", reservationId);

        // Clear cache
        redisService.delete("inventory:" + productId);

        log.info("Stock released for product: {}", productId);
    }

    /**
     * Confirm stock deduction (after order completed).
     */
    @Transactional
    public void confirmDeduction(UUID productId, Integer quantity, String reservationId) {
        log.info("Confirming deduction for product: {}, quantity: {}", productId, quantity);

        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new InventoryException(ErrorCodes.INV_001));

        // Find and update reservation
        StockReservation reservation = reservationRepository.findByReservationId(reservationId)
                .orElseThrow(() -> new InventoryException(ErrorCodes.INV_003));

        // Final deduction from reserved
        int oldReserved = inventory.getReservedStock();
        int oldTotal = inventory.getTotalStock();

        inventory.setReservedStock(Math.max(0, oldReserved - quantity));
        inventory.setTotalStock(oldTotal - quantity);
        inventoryRepository.save(inventory);

        // Update reservation
        reservation.setStatus("CONFIRMED");
        reservationRepository.save(reservation);

        // Record movement
        recordMovement(productId, "DEDUCT", -quantity, oldTotal, inventory.getTotalStock(),
                "Stock deducted after order completion", reservationId);

        // Update product
        productRepository.findById(productId).ifPresent(product -> {
            product.setStockQuantity(inventory.getAvailableStock());
            productRepository.save(product);
        });

        // Clear cache
        redisService.delete("inventory:" + productId);

        log.info("Stock deduction confirmed for product: {}", productId);
    }

    /**
     * Get stock movements.
     */
    @Transactional(readOnly = true)
    public List<StockMovementDTO> getStockMovements(UUID productId, int page, int size) {
        log.info("Getting stock movements for product: {}", productId);

        List<StockMovement> movements = movementRepository.findByProductIdOrderByCreatedAtDesc(productId);

        return movements.stream()
                .map(this::toMovementDTO)
                .toList();
    }

    /**
     * Set stock alert threshold.
     */
    @Transactional
    public void setStockAlert(UUID productId, Integer threshold) {
        log.info("Setting stock alert for product: {}, threshold: {}", productId, threshold);

        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseGet(() -> createInventory(productId));

        inventory.setLowStockThreshold(threshold);
        inventoryRepository.save(inventory);

        // Clear cache
        redisService.delete("inventory:" + productId);

        log.info("Stock alert set for product: {}", productId);
    }

    // ==================== HELPERS ====================

    /**
     * Create new inventory record.
     */
    private Inventory createInventory(UUID productId) {
        Inventory inventory = Inventory.builder()
                .productId(productId)
                .availableStock(0)
                .reservedStock(0)
                .totalStock(0)
                .lowStockThreshold(10)
                .build();
        return inventoryRepository.save(inventory);
    }

    /**
     * Record stock movement.
     */
    private void recordMovement(UUID productId, String type, Integer quantity, 
                               Integer balanceBefore, Integer balanceAfter,
                               String reason, String reference) {
        StockMovement movement = StockMovement.builder()
                .productId(productId)
                .type(type)
                .quantity(quantity)
                .balanceBefore(balanceBefore)
                .balanceAfter(balanceAfter)
                .reason(reason)
                .reference(reference)
                .build();
        movementRepository.save(movement);
    }

    /**
     * Convert Inventory to DTO.
     */
    private InventoryDTO toInventoryDTO(Inventory inventory) {
        return InventoryDTO.builder()
                .productId(inventory.getProductId())
                .availableStock(inventory.getAvailableStock())
                .reservedStock(inventory.getReservedStock())
                .totalStock(inventory.getTotalStock())
                .lowStockThreshold(inventory.getLowStockThreshold())
                .isLowStock(inventory.getAvailableStock() <= inventory.getLowStockThreshold())
                .isOutOfStock(inventory.getAvailableStock() <= 0)
                .stockStatus(inventory.getStockStatus().name())
                .lastRestockedAt(inventory.getLastRestockedAt())
                .updatedAt(inventory.getUpdatedAt())
                .build();
    }

    /**
     * Convert to LowStockDTO.
     */
    private LowStockDTO toLowStockDTO(Inventory inventory) {
        Product product = productRepository.findById(inventory.getProductId()).orElse(null);
        return LowStockDTO.builder()
                .productId(inventory.getProductId())
                .productName(product != null ? product.getName() : null)
                .sku(product != null ? product.getSku() : null)
                .availableStock(inventory.getAvailableStock())
                .threshold(inventory.getLowStockThreshold())
                .reorderLevel(inventory.getLowStockThreshold() * 2)
                .status(inventory.getAvailableStock() <= 0 ? "OUT_OF_STOCK" : "LOW_STOCK")
                .build();
    }

    /**
     * Convert StockMovement to DTO.
     */
    private StockMovementDTO toMovementDTO(StockMovement movement) {
        return StockMovementDTO.builder()
                .id(movement.getId())
                .productId(movement.getProductId())
                .type(movement.getType())
                .quantity(movement.getQuantity())
                .balanceBefore(movement.getBalanceBefore())
                .balanceAfter(movement.getBalanceAfter())
                .reason(movement.getReason())
                .reference(movement.getReference())
                .createdAt(movement.getCreatedAt())
                .build();
    }

    /**
     * Custom inventory exception.
     */
    public static class InventoryException extends RuntimeException {
        private final ErrorCodes errorCode;

        public InventoryException(ErrorCodes errorCode) {
            super(errorCode.getDefaultMessage());
            this.errorCode = errorCode;
        }

        public ErrorCodes getErrorCode() {
            return errorCode;
        }
    }
}
