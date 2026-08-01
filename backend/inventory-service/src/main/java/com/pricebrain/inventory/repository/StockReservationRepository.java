package com.pricebrain.inventory.repository;

import com.pricebrain.shared.model.StockReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Stock reservation repository.
 */
@Repository
public interface StockReservationRepository extends JpaRepository<StockReservation, UUID> {

    /**
     * Find by reservation ID.
     */
    Optional<StockReservation> findByReservationId(String reservationId);

    /**
     * Find by order ID.
     */
    List<StockReservation> findByOrderId(UUID orderId);

    /**
     * Find expired reservations.
     */
    List<StockReservation> findByStatusAndExpiresAtBefore(String status, Instant expiresAt);

    /**
     * Delete expired reservations.
     */
    @Modifying
    @Query("DELETE FROM StockReservation r WHERE r.expiresAt < :now AND r.status = 'RESERVED'")
    int deleteExpiredReservations(@Param("now") Instant now);
}
