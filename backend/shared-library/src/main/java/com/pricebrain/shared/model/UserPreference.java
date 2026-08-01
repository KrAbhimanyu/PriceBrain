package com.pricebrain.shared.model;

import jakarta.persistence.*;
import lombok.*;

/**
 * User preferences entity for storing user settings.
 */
@Entity
@Table(name = "user_preferences")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    // Language and Region
    @Column(name = "language", length = 10)
    @Builder.Default
    private String language = "en";

    @Column(name = "currency", length = 10)
    @Builder.Default
    private String currency = "INR";

    @Column(name = "timezone", length = 50)
    @Builder.Default
    private String timezone = "Asia/Kolkata";

    // Notification Preferences
    @Column(name = "email_order_updates")
    @Builder.Default
    private Boolean emailOrderUpdates = true;

    @Column(name = "email_promotions")
    @Builder.Default
    private Boolean emailPromotions = true;

    @Column(name = "email_newsletter")
    @Builder.Default
    private Boolean emailNewsletter = true;

    @Column(name = "push_order_updates")
    @Builder.Default
    private Boolean pushOrderUpdates = true;

    @Column(name = "push_recommendations")
    @Builder.Default
    private Boolean pushRecommendations = true;

    @Column(name = "push_price_alerts")
    @Builder.Default
    private Boolean pushPriceAlerts = true;

    @Column(name = "sms_order_updates")
    @Builder.Default
    private Boolean smsOrderUpdates = false;

    @Column(name = "sms_marketing")
    @Builder.Default
    private Boolean smsMarketing = false;

    // Privacy Preferences
    @Column(name = "show_profile_public")
    @Builder.Default
    private Boolean showProfilePublic = false;

    @Column(name = "show_orders_public")
    @Builder.Default
    private Boolean showOrdersPublic = false;

    @Column(name = "allow_data_analytics")
    @Builder.Default
    private Boolean allowDataAnalytics = true;

    @Column(name = "show_reviews_public")
    @Builder.Default
    private Boolean showReviewsPublic = true;

    // Communication Preferences
    @Column(name = "preferred_contact_method")
    @Builder.Default
    private String preferredContactMethod = "EMAIL";

    // Display Preferences
    @Column(name = "product_view_mode")
    @Builder.Default
    private String productViewMode = "GRID";

    @Column(name = "items_per_page")
    @Builder.Default
    private Integer itemsPerPage = 20;

    @Column(name = "sort_products_by")
    @Builder.Default
    private String sortProductsBy = "RELEVANCE";

    // Wishlist Privacy
    @Column(name = "wishlist_public")
    @Builder.Default
    private Boolean wishlistPublic = false;

    // Two-Factor Authentication
    @Column(name = "two_factor_enabled")
    @Builder.Default
    private Boolean twoFactorEnabled = false;

    @Column(name = "two_factor_method")
    @Builder.Default
    private String twoFactorMethod = "APP";
}
