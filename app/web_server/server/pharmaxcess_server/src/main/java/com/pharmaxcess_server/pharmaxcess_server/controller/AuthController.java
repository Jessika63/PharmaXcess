package com.pharmaxcess_server.pharmaxcess_server.controller;

import com.pharmaxcess_server.pharmaxcess_server.dto.UserRegisterRequest;
import com.pharmaxcess_server.pharmaxcess_server.mapper.UserMapper;
import com.pharmaxcess_server.pharmaxcess_server.model.User;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

import com.pharmaxcess_server.pharmaxcess_server.service.JwtService;
import com.pharmaxcess_server.pharmaxcess_server.service.UserService;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final JwtService jwtService;

    @Autowired
    private final UserService userService;

    @Autowired
    private final UserMapper userMapper;


    public AuthController(JwtService jwtService, UserService userService, UserMapper userMapper) {
        this.jwtService = jwtService;
        this.userService = userService;
        this.userMapper = userMapper;
    }

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody User loginRequest) {
        try {
            Optional<User> user = userService.findByEmail(loginRequest.getEmail());

            if (!user.isPresent())
            return null;

            String token = jwtService.generateToken(loginRequest.getEmail(), user.get().getRole());

            Map<String, String> response = new HashMap<>();
            response.put("token", token);
            return response;

        } catch (AuthenticationException e) {
            throw new RuntimeException("Invalid username/password.", e);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody UserRegisterRequest user) {
        if (userService.findByEmail(user.getEmail()).isPresent() || userService.findByUsername(user.getUsername()).isPresent())
            return ResponseEntity.badRequest().body("User with this Email/Username already exists!");

        User formattedUser = userMapper.userRegisterToUser(user);

        userService.save(formattedUser);
        return ResponseEntity.ok("User registered successfully!");
    }

    @PostMapping("/logout")
    public String logout(@RequestHeader("Authorization") String token) {
        if (token != null && token.startsWith("Bearer ")) {
            String jwt = token.substring(7);
            jwtService.invalidateToken(jwt);
            return "Successfully logged out";
        }
        throw new RuntimeException("Invalid or missing token");
    }
}