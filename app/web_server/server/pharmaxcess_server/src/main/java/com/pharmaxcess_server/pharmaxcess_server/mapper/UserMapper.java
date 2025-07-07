package com.pharmaxcess_server.pharmaxcess_server.mapper;

import com.pharmaxcess_server.pharmaxcess_server.dto.UserRegisterRequest;
import com.pharmaxcess_server.pharmaxcess_server.model.User;
import org.springframework.stereotype.Component;

/**
 * Mapper class for converting user-related DTOs to entities.
 */
@Component
public class UserMapper {

    /**
     * Converts a {@link UserRegisterRequest} DTO to a {@link User} entity.
     *
     * @param userRegister the user registration request DTO
     * @return a {@link User} entity populated with data from the DTO
     */
    public User userRegisterToUser(UserRegisterRequest userRegister) {
        User user = new User();

        user.setEmail(userRegister.getEmail());
        user.setName(userRegister.getName());
        user.setSurname(userRegister.getSurname());
        user.setUsername(userRegister.getUsername());
        user.setPassword(userRegister.getPassword());

        return user;
    }
}