package com.pharmaxcess_server.pharmaxcess_server.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

/**
 * Represents a user entity in the system.
 * Implements {@link UserDetails} for integration with Spring Security.
 */
@Entity
@Table(name = "users")
public class User implements UserDetails {

    /**
     * Constructs a user with the specified email and role.
     *
     * @param email the email of the user.
     * @param role the role of the user.
     */
    public User(String email, String role) {
        this.email = email;
        this.role = role;
    }

    /**
     * Default constructor required by JPA.
     */
    public User() {

    }

    /**
     * Unique identifier for the user.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The password reset token.
     */
    @Column(name = "reset_token")
    private String resetToken;

    /**
     * The password reset token expiracy date.
     */
    @Column(name = "reset_token_expiracy")
    private LocalDateTime resetTokenExpiry;

    /**
     * The surname of the user.
     */
    @Column(nullable = false)
    private String surname;

    /**
     * The first name of the user.
     */
    @Column(nullable = false)
    private String name;

    /**
     * The password of the user.
     */
    @Column(nullable = false)
    private String password;

    /**
     * The email address of the user.
     * Must be unique.
     */
    @Column(nullable = false, unique = true)
    private String email;

    /**
     * The username of the user.
     * Must be unique.
     */
    @Column(nullable = false, unique = true)
    private String username;

    /**
     * The role of the user, such as "USER" or "ADMIN".
     */
    @Column(nullable = false)
    private String role;

    /**
     * The timestamp when the user was created.
     */
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    /**
     * Gets the unique identifier for the user.
     *
     * @return the user's ID.
     */
    public Long getId() {
        return id;
    }

    /**
     * Sets the unique identifier for the user.
     *
     * @param id the user's ID.
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Gets the surname of the user.
     *
     * @return the user's surname.
     */
    public String getSurname() {
        return surname;
    }

    /**
     * Sets the surname of the user.
     *
     * @param surname the user's surname.
     */
    public void setSurname(String surname) {
        this.surname = surname;
    }

    /**
     * Gets the first name of the user.
     *
     * @return the user's name.
     */
    public String getName() {
        return name;
    }

    /**
     * Sets the first name of the user.
     *
     * @param name the user's name.
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Sets the username of the user.
     *
     * @param username the user's username.
     */
    public void setUsername(String username) {
        this.username = username;
    }

    /**
     * Gets the username of the user.
     *
     * @return the user's username.
     */
    public String getUsername() {
        return username;
    }

    /**
     * Gets the password of the user.
     *
     * @return the user's password.
     */
    public String getPassword() {
        return password;
    }

    /**
     * Sets the password of the user.
     *
     * @param password the user's password.
     */
    public void setPassword(String password) {
        this.password = password;
    }

    /**
     * Gets the email address of the user.
     *
     * @return the user's email address.
     */
    public String getEmail() {
        return email;
    }

    /**
     * Sets the email address of the user.
     *
     * @param email the user's email address.
     */
    public void setEmail(String email) {
        this.email = email;
    }

    /**
     * Gets the role of the user.
     *
     * @return the user's role.
     */
    public String getRole() {
        return role;
    }

    /**
     * Sets the role of the user.
     *
     * @param role the user's role.
     */
    public void setRole(String role) {
        this.role = role;
    }

    /**
     * Gets the timestamp when the user was created.
     *
     * @return the timestamp of user creation.
     */
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    /**
     * Sets the timestamp when the user was created.
     *
     * @param createdAt the timestamp of user creation.
     */
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    /**
     * Gets the authorities granted to the user.
     *
     * @return a collection containing the user's role.
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singleton(() -> role);
    }

    /**
     * Indicates whether the user's account is expired.
     *
     * @return true if the account is not expired.
     */
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    /**
     * Indicates whether the user's account is locked.
     *
     * @return true if the account is not locked.
     */
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    /**
     * Indicates whether the user's credentials are expired.
     *
     * @return true if the credentials are not expired.
     */
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    /**
     * Indicates whether the user is enabled.
     *
     * @return true if the user is enabled.
     */
    @Override
    public boolean isEnabled() {
        return true;
    }

    /**
     * Sets the password reset token for the user.
     *
     * @param token The reset token to be assigned.
     */
    public void setResetToken(String token) {
        this.resetToken = token;
    }

    /**
     * Retrieves the password reset token of the user.
     *
     * @return The reset token.
     */
    public String getResetToken() {
        return this.resetToken;
    }

    /**
     * Retrieves the expiration time of the password reset token.
     *
     * @return The expiration timestamp of the reset token.
     */
    public LocalDateTime getResetTokenExpiry() {
        return resetTokenExpiry;
    }

    /**
     * Sets the expiration time for the password reset token.
     *
     * @param resetTokenExpiry The expiration timestamp to be assigned.
     */
    public void setResetTokenExpiry(LocalDateTime resetTokenExpiry) {
        this.resetTokenExpiry = resetTokenExpiry;
    }
}
