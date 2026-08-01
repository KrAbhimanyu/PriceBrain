package com.pricebrain.shared.repository;

import com.pricebrain.shared.model.Brand;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Brand entity operations.
 */
@Repository
public interface BrandRepository extends JpaRepository<Brand, UUID> {

    /**
     * Find brand by slug.
     */
    Optional<Brand> findBySlug(String slug);

    /**
     * Check if slug exists.
     */
    boolean existsBySlug(String slug);

    /**
     * Find brand by name.
     */
    Optional<Brand> findByNameIgnoreCase(String name);

    /**
     * Find active brands.
     */
    List<Brand> findByIsActiveTrueOrderByName();

    /**
     * Find verified brands.
     */
    List<Brand> findByIsVerifiedTrueAndIsActiveTrueOrderByName();

    /**
     * Search brands by name.
     */
    @Query("SELECT b FROM Brand b WHERE LOWER(b.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Brand> searchBrands(@Param("query") String query, Pageable pageable);

    /**
     * Find brands sorted by product count.
     */
    List<Brand> findByIsActiveTrueOrderByProductCountDesc();

    /**
     * Update product count.
     */
    @Modifying
    @Query("UPDATE Brand b SET b.productCount = b.productCount + :delta WHERE b.id = :brandId")
    void updateProductCount(@Param("brandId") UUID brandId, @Param("delta") int delta);
}
