package com.pricebrain.shared.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

/**
 * Address entity for user shipping and billing addresses.
 */
@Entity
@Table(name = "addresses", indexes = {
    @Index(name = "idx_addresses_user_id", columnList = "user_id"),
    @Index(name = "idx_addresses_user_default", columnList = "user_id, is_default")
})
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Address extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    @Builder.Default
    private AddressType type = AddressType.SHIPPING;

    @Column(name = "recipient_name", nullable = false)
    private String recipientName;

    @Column(name = "phone", nullable = false)
    private String phone;

    @Column(name = "address_line_1", nullable = false)
    private String addressLine1;

    @Column(name = "address_line_2")
    private String addressLine2;

    @Column(name = "landmark")
    private String landmark;

    @Column(name = "city", nullable = false)
    private String city;

    @Column(name = "state", nullable = false)
    private String state;

    @Column(name = "postal_code", nullable = false)
    private String postalCode;

    @Column(name = "country", nullable = false)
    @Builder.Default
    private String country = "IN";

    @Column(name = "label")
    private String label;

    @Column(name = "is_default", nullable = false)
    @Builder.Default
    private Boolean isDefault = false;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "instructions")
    private String deliveryInstructions;

    /**
     * Get full address as string.
     */
    public String getFullAddress() {
        StringBuilder sb = new StringBuilder();
        sb.append(addressLine1);
        if (addressLine2 != null && !addressLine2.isEmpty()) {
            sb.append(", ").append(addressLine2);
        }
        if (landmark != null && !landmark.isEmpty()) {
            sb.append(", Near ").append(landmark);
        }
        sb.append(", ").append(city);
        sb.append(", ").append(state);
        sb.append(" - ").append(postalCode);
        sb.append(", ").append(country);
        return sb.toString();
    }

    /**
     * Address type enum.
     */
    public enum AddressType {
        SHIPPING,
        BILLING,
        BOTH
    }
}
