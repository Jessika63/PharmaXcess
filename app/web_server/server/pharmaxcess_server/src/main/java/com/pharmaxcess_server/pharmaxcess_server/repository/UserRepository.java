package com.pharmaxcess_server.pharmaxcess_server.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.pharmaxcess_server.pharmaxcess_server.model.User;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    List<User> findAll();
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
}
