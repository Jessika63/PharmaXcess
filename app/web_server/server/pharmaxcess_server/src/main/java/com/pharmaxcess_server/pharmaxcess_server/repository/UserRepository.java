package com.pharmaxcess_server.pharmaxcess_server.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.pharmaxcess_server.pharmaxcess_server.model.User;

import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for managing {@link User} entities.
 * <p>
 * This interface extends {@link JpaRepository}, providing CRUD operations for the User entity.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Retrieves all users from the database.
     *
     * @return a list of all {@link User} entities
     */
    List<User> findAll();

    /**
     * Finds a user by their email address.
     *
     * @param email the email of the user to search for
     * @return an {@link Optional} containing the user if found, otherwise empty
     */
    Optional<User> findByEmail(String email);

    /**
     * Finds a user by their username.
     *
     * @param username the username of the user to search for
     * @return an {@link Optional} containing the user if found, otherwise empty
     */
    Optional<User> findByUsername(String username);
}