package com.pricebrain.inventory.repository;

import com.pricebrain.shared.model.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Stock movement repository.
 */
@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, UUID> {

    /**
     * Find by product ID ordered by creation date.
     */
    List<StockMovement> findByProductIdOrderByCreatedAtDesc(UUID productId);

    /**
     * Find by type.
     */
    List<StockMovement> findByType(String type);
}
