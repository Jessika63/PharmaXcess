package com.pharmaxcess_server.pharmaxcess_server.controller;

import com.pharmaxcess_server.pharmaxcess_server.dto.UserLoginRequest;
import com.pharmaxcess_server.pharmaxcess_server.dto.UserRegisterRequest;
import com.pharmaxcess_server.pharmaxcess_server.mapper.UserMapper;
import com.pharmaxcess_server.pharmaxcess_server.model.User;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

import com.pharmaxcess_server.pharmaxcess_server.service.JwtService;
import com.pharmaxcess_server.pharmaxcess_server.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * REST controller for handling user authentication operations.
 * Provides endpoints for login, registration, and logout.
 */
@RestController
@RequestMapping("/api/auth")
@Tag(name = "User Authentication", description = "Operations related to user authentication")
public class AuthController {

    private final JwtService jwtService;
    private final UserService userService;
    private final UserMapper userMapper;

    /**
     * Constructs an AuthController.
     *
     * @param jwtService the service for handling JWT token generation and invalidation
     * @param userService the service for handling user operations
     * @param userMapper the mapper for converting user-related DTOs
     */
    @Autowired
    public AuthController(JwtService jwtService, UserService userService, UserMapper userMapper) {
        this.jwtService = jwtService;
        this.userService = userService;
        this.userMapper = userMapper;
    }

    /**
     * Authenticates a user with email and password, and returns a JWT token if credentials are valid.
     *
     * @param loginRequest the request body containing the user's email and password
     * @return a map containing the JWT token if authentication is successful
     */
    @PostMapping("/login")
    @Operation(
        summary = "User Login",
        description = "Authenticates a user with email and password. Returns a JWT token if the credentials are valid."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successful login, JWT token returned."),
        @ApiResponse(responseCode = "401", description = "Invalid email or password."),
        @ApiResponse(responseCode = "500", description = "Internal server error.")
    })
    public Map<String, String> login(@RequestBody UserLoginRequest loginRequest) {
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

    /**
     * Registers a new user. If the email or username already exists, an error is returned.
     *
     * @param user the request body containing user registration data
     * @return a response indicating whether registration was successful or not
     */
    @PostMapping("/register")
    @Operation(
        summary = "User Registration",
        description = "Registers a new user. If the email or username already exists, an error is returned."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User registered successfully."),
        @ApiResponse(responseCode = "400", description = "User with this Email/Username already exists."),
        @ApiResponse(responseCode = "500", description = "Internal server error.")
    })
    public ResponseEntity<String> registerUser(@RequestBody UserRegisterRequest user) {
        if (userService.findByEmail(user.getEmail()).isPresent() || userService.findByUsername(user.getUsername()).isPresent())
            return ResponseEntity.badRequest().body("User with this Email/Username already exists!");

        User formattedUser = userMapper.userRegisterToUser(user);

        userService.save(formattedUser);
        return ResponseEntity.ok("User registered successfully!");
    }

    /**
     * Logs out the user by invalidating the provided JWT token.
     *
     * @param token the JWT token to invalidate
     * @return a message indicating successful logout
     */
    @PostMapping("/logout")
    @Operation(
        summary = "User Logout",
        description = "Logs out the user by invalidating the provided JWT token."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully logged out."),
        @ApiResponse(responseCode = "400", description = "Invalid or missing token."),
        @ApiResponse(responseCode = "500", description = "Internal server error.")
    })
    public String logout(@RequestHeader("Authorization") String token) {
        if (token != null && token.startsWith("Bearer ")) {
            String jwt = token.substring(7);
            jwtService.invalidateToken(jwt);
            return "Successfully logged out";
        }
        throw new RuntimeException("Invalid or missing token");
    }
}