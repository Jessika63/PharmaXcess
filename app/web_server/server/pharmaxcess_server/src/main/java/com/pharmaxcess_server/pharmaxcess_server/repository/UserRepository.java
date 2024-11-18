package com.pharmaxcess_server.pharmaxcess_server.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pharmaxcess_server.pharmaxcess_server.model.User;

import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    List<User> findAll();
}
