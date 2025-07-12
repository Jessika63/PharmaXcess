package com.pharmaxcess_server.pharmaxcess_server.service;
import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.UUID;
import com.pharmaxcess_server.pharmaxcess_server.model.User;
import com.pharmaxcess_server.pharmaxcess_server.repository.UserRepository;

/**
 * Service class for handling user-related operations.
 * <p>
 * This service provides methods to interact with the {@link UserRepository} for saving and retrieving
 * users by email or username.
 * </p>
 */
@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Saves the given user to the database.
     *
     * @param user the {@link User} to be saved
     * @return the saved {@link User}
     */
    public User save(User user) {
        return userRepository.save(user);
    }

    /**
     * Retrieves a user by their email address.
     *
     * @param email the email of the user to search for
     * @return an {@link Optional} containing the user if found, otherwise empty
     */
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /**
     * Retrieves a user by their username.
     *
     * @param username the username of the user to search for
     * @return an {@link Optional} containing the user if found, otherwise empty
     */
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    /**
     * Resets the user's password if the provided token is valid and not expired.
     *
     * @param token       The password reset token.
     * @param newPassword The new password to be set.
     * @return {@code true} if the password was successfully reset, {@code false} if the token is invalid or expired.
     */
    public boolean resetPassword(String token, String newPassword) {
        Optional<User> optionalUser = userRepository.findByResetToken(token);

        if (optionalUser.isPresent()) {
            User user = optionalUser.get();

            if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
                return false;
            }
            user.setPassword(passwordEncoder.encode(newPassword));
            user.setResetToken(null);
            user.setResetTokenExpiry(null);
            userRepository.save(user);
            return true;
        }
        return false;
    }

    /**
     * Generates a password reset token for a user identified by their email.
     *
     * @param email The email address associated with the user account.
     * @return A URL containing the reset token if the user exists, otherwise an empty string.
     */
    public String generatePasswordResetToken(String email) {
        Optional<User> optionalUser = userRepository.findByEmail(email);

        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            String token = UUID.randomUUID().toString();

            user.setResetToken(token);
            user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
            userRepository.save(user);

            return "http://localhost:8080/api/users/reset-password?token=" + token;
        }
        return "";
    }
}