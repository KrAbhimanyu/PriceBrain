package com.pricebrain.user.repository;

import com.pricebrain.shared.model.UserPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for UserPreference entity.
 */
@Repository
public interface UserPreferenceRepository extends JpaRepository<UserPreference, UUID> {

    /**
     * Find preferences by user ID.
     */
    Optional<UserPreference> findByUserId(UUID userId);

    /**
     * Delete preferences by user ID.
     */
    void deleteByUserId(UUID userId);

    /**
     * Check if preferences exist for user.
     */
    boolean existsByUserId(UUID userId);
}
