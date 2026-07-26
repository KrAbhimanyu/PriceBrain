package com.pricebrain.shared.repository;

import com.pricebrain.shared.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Category entity operations.
 */
@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {

    /**
     * Find category by slug.
     */
    Optional<Category> findBySlug(String slug);

    /**
     * Check if slug exists.
     */
    boolean existsBySlug(String slug);

    /**
     * Find categories by parent.
     */
    List<Category> findByParentIdOrderBySortOrder(UUID parentId);

    /**
     * Find root categories (no parent).
     */
    List<Category> findByParentIdIsNullOrderBySortOrder();

    /**
     * Find active categories.
     */
    List<Category> findByIsActiveTrueOrderBySortOrder();

    /**
     * Find active root categories.
     */
    List<Category> findByParentIdIsNullAndIsActiveTrueOrderBySortOrder();

    /**
     * Find categories by level.
     */
    List<Category> findByLevelOrderBySortOrder(int level);

    /**
     * Find categories by name containing.
     */
    List<Category> findByNameContainingIgnoreCase(String name);

    /**
     * Update product count.
     */
    @Modifying
    @Query("UPDATE Category c SET c.productCount = c.productCount + :delta WHERE c.id = :categoryId")
    void updateProductCount(@Param("categoryId") UUID categoryId, @Param("delta") int delta);

    /**
     * Reset product count.
     */
    @Modifying
    @Query("UPDATE Category c SET c.productCount = 0")
    void resetAllProductCounts();

    /**
     * Find categories sorted by product count.
     */
    List<Category> findByIsActiveTrueOrderByProductCountDesc();
}
