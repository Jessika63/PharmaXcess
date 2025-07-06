package com.pharmaxcess_server.pharmaxcess_server.dto;

/**
 * The UserRegisterRequest class represents a data transfer object (DTO) for user registration requests.
 * It contains the necessary information for registering a user, including email, name, surname, username, and password.
 * This class provides getter and setter methods for each field.
 */
public class UserRegisterRequest {
    private String email;
    private String name;
    private String surname;
    private String username;
    private String password;

    /**
     * Gets the email of the user.
     *
     * @return the email of the user
     */
    public String getEmail() {
        return this.email;
    }

    /**
     * Sets the email of the user.
     *
     * @param email the email of the user
     */
    public void setEmail(String email) {
        this.email = email;
    }

    /**
     * Gets the surname of the user.
     *
     * @return the surname of the user
     */
    public String getSurname() {
        return surname;
    }

    /**
     * Sets the surname of the user.
     *
     * @param surname the surname of the user
     */
    public void setSurname(String surname) {
        this.surname = surname;
    }

    /**
     * Gets the name of the user.
     *
     * @return the name of the user
     */
    public String getName() {
        return name;
    }

    /**
     * Sets the name of the user.
     *
     * @param name the name of the user
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Gets the username of the user.
     *
     * @return the username of the user
     */
    public String getUsername() {
        return username;
    }

    /**
     * Sets the username of the user.
     *
     * @param username the username of the user
     */
    public void setUsername(String username) {
        this.username = username;
    }

    /**
     * Gets the password of the user.
     *
     * @return the password of the user
     */
    public String getPassword() {
        return password;
    }

    /**
     * Sets the password of the user.
     *
     * @param password the password of the user
     */
    public void setPassword(String password) {
        this.password = password;
    }
}
