package com.pharmaxcess_server.pharmaxcess_server.mapper;

import com.pharmaxcess_server.pharmaxcess_server.dto.UserRegisterRequest;
import com.pharmaxcess_server.pharmaxcess_server.model.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {
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