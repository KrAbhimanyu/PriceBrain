package com.pricebrain.review.repository;

import com.pricebrain.shared.document.ReviewDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Review MongoDB repository.
 */
@Repository
public interface ReviewRepository extends MongoRepository<ReviewDocument, UUID> {
    
    List<ReviewDocument> findByProductIdOrderByCreatedAtDesc(UUID productId);
    
    List<ReviewDocument> findByUserIdOrderByCreatedAtDesc(UUID userId);
    
    Optional<ReviewDocument> findByProductIdAndUserId(UUID productId, UUID userId);
    
    long countByProductId(UUID productId);
    
    long countByProductIdAndRating(UUID productId, Integer rating);
}
