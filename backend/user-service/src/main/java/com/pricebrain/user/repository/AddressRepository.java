package com.pricebrain.user.repository;

import com.pricebrain.shared.model.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Address entity.
 */
@Repository
public interface AddressRepository extends JpaRepository<Address, UUID> {

    /**
     * Find all addresses by user ID, ordered by default status and creation date.
     */
    List<Address> findByUserIdOrderByIsDefaultDescCreatedAtDesc(UUID userId);

    /**
     * Find address by ID and user ID.
     */
    Optional<Address> findByIdAndUserId(UUID addressId, UUID userId);

    /**
     * Find default shipping address.
     */
    @Query("SELECT a FROM Address a WHERE a.userId = :userId AND a.isDefault = true AND (a.type = 'SHIPPING' OR a.type = 'BOTH')")
    Optional<Address> findDefaultShippingByUserId(@Param("userId") UUID userId);

    /**
     * Find default billing address.
     */
    @Query("SELECT a FROM Address a WHERE a.userId = :userId AND a.isDefault = true AND (a.type = 'BILLING' OR a.type = 'BOTH')")
    Optional<Address> findDefaultBillingByUserId(@Param("userId") UUID userId);

    /**
     * Clear all default shipping addresses for user.
     */
    @Modifying
    @Query("UPDATE Address a SET a.isDefault = false WHERE a.userId = :userId AND (a.type = 'SHIPPING' OR a.type = 'BOTH')")
    void clearDefaultShipping(@Param("userId") UUID userId);

    /**
     * Clear all default billing addresses for user.
     */
    @Modifying
    @Query("UPDATE Address a SET a.isDefault = false WHERE a.userId = :userId AND (a.type = 'BILLING' OR a.type = 'BOTH')")
    void clearDefaultBilling(@Param("userId") UUID userId);

    /**
     * Count addresses by user ID.
     */
    long countByUserId(UUID userId);

    /**
     * Delete all addresses by user ID.
     */
    void deleteByUserId(UUID userId);
}
