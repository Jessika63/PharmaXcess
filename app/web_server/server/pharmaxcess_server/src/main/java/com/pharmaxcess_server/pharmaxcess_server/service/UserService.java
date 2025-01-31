package com.pharmaxcess_server.pharmaxcess_server.service;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;
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
}