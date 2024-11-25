package com.pharmaxcess_server.pharmaxcess_server.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;

import com.pharmaxcess_server.pharmaxcess_server.dto.UserRegisterRequest;
import com.pharmaxcess_server.pharmaxcess_server.model.User;
import com.pharmaxcess_server.pharmaxcess_server.service.UserService;
import com.pharmaxcess_server.pharmaxcess_server.mapper.UserMapper;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private final UserService userService;

    @Autowired
    private final UserMapper userMapper;

    @Autowired
    public UserController(UserService userService, UserMapper userMapper) {
        this.userService = userService;
        this.userMapper = userMapper;
    }

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody UserRegisterRequest user) {
        if (userService.findByEmail(user.getEmail()).isPresent())
            return ResponseEntity.badRequest().body("User with this email already exists!");

        User formattedUser = userMapper.userRegisterToUser(user);

        userService.save(formattedUser);
        return ResponseEntity.ok("User registered successfully!");
    }

    @PostMapping("/login")
    public ResponseEntity<String> loginUser(@RequestBody UserRegisterRequest user) {
        if (!userService.findByEmail(user.getEmail()).isPresent())
            return ResponseEntity.badRequest().body("Wrong Email or password!");
        // TO DO
        return ResponseEntity.ok("User logged in successfully!");
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logoutUser() {
        // TO DO
        return ResponseEntity.ok("User logged out successfully!");
    }
}
