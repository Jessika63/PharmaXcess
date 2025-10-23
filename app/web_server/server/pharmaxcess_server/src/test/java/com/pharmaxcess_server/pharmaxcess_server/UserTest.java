package com.pharmaxcess_server.pharmaxcess_server;

import com.pharmaxcess_server.pharmaxcess_server.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class UserTest {

    private User user;

    @BeforeEach
    void setUp() {
        user = new User("test@example.com", "USER");
        user.setId(1L);
        user.setSurname("Doe");
        user.setName("John");
        user.setPassword("password123");
        user.setUsername("johndoe");
        user.setRole("USER");
    }

    @Test
    void testGetId() {
        assertEquals(1L, user.getId());
    }

    @Test
    void testGetSurname() {
        assertEquals("Doe", user.getSurname());
    }

    @Test
    void testGetName() {
        assertEquals("John", user.getName());
    }

    @Test
    void testGetEmail() {
        assertEquals("test@example.com", user.getEmail());
    }

    @Test
    void testGetUsername() {
        assertEquals("johndoe", user.getUsername());
    }

    @Test
    void testGetRole() {
        assertEquals("USER", user.getRole());
    }

    @Test
    void testSetId() {
        user.setId(2L);
        assertEquals(2L, user.getId());
    }

    @Test
    void testSetSurname() {
        user.setSurname("Smith");
        assertEquals("Smith", user.getSurname());
    }

    @Test
    void testSetName() {
        user.setName("Jane");
        assertEquals("Jane", user.getName());
    }

    @Test
    void testSetEmail() {
        user.setEmail("new@example.com");
        assertEquals("new@example.com", user.getEmail());
    }

    @Test
    void testSetUsername() {
        user.setUsername("janesmith");
        assertEquals("janesmith", user.getUsername());
    }

    @Test
    void testSetRole() {
        user.setRole("ADMIN");
        assertEquals("ADMIN", user.getRole());
    }
}