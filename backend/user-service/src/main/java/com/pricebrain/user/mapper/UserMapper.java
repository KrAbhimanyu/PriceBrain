package com.pricebrain.user.mapper;

import com.pricebrain.shared.model.Address;
import com.pricebrain.shared.model.User;
import com.pricebrain.shared.model.UserPreference;
import com.pricebrain.user.controller.UserController.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

/**
 * MapStruct mapper for User entities and DTOs.
 */
@Mapper(componentModel = "spring", 
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface UserMapper {

    // User to Profile DTO
    @Mapping(target = "fullName", expression = "java(user.getFullName())")
    @Mapping(target = "role", expression = "java(user.getRole().name())")
    UserProfileDTO toProfileDTO(User user);

    // Address to DTO
    AddressDTO toAddressDTO(Address address);

    // UserPreference to PreferencesDTO
    PreferencesDTO toPreferencesDTO(UserPreference preference);

    // Update entity methods
    void updateUserFromRequest(UpdateProfileRequest request, @MappingTarget User user);
    
    void updateAddressFromRequest(AddressRequest request, @MappingTarget Address address);
    
    void updatePreferencesFromRequest(UpdatePreferencesRequest request, @MappingTarget UserPreference preference);
}
