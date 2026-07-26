package com.pricebrain.inventory.repository;

import com.pricebrain.shared.model.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Inventory repository.
 */
@Repository
public interface InventoryRepository extends JpaRepository<Inventory, UUID> {

    /**
     * Find by product ID.
     */
    Optional<Inventory> findByProductId(UUID productId);

    /**
     * Find low stock products.
     */
    @Query("SELECT i FROM Inventory i WHERE i.availableStock <= :threshold ORDER BY i.availableStock ASC")
    List<Inventory> findLowStockProducts(@Param("threshold") int threshold, int limit);

    /**
     * Find out of stock products.
     */
    List<Inventory> findByAvailableStock(int availableStock);

    /**
     * Check if product has stock.
     */
    boolean existsByProductIdAndAvailableStockGreaterThan(UUID productId, int quantity);
}
