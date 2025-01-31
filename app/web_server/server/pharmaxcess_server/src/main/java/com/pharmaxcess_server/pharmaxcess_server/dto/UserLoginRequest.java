package com.pharmaxcess_server.pharmaxcess_server.dto;

/**
 * The UserLoginRequest class represents a data transfer object (DTO) for user login requests.
 * It contains the user's email and password, along with getter and setter methods for these fields.
 */
public class UserLoginRequest {

    private String Email;
    private String Password;

    /**
     * Gets the email of the user.
     *
     * @return the email of the user
     */
    public String getEmail() {
        return this.Email;
    }

    /**
     * Sets the email of the user.
     *
     * @param email the email of the user
     */
    public void setEmail(String email) {
        this.Email = email;
    }

    /**
     * Gets the password of the user.
     *
     * @return the password of the user
     */
    public String getPassword() {
        return this.Password;
    }

    /**
     * Sets the password of the user.
     *
     * @param password the password of the user
     */
    public void setPassword(String password) {
        this.Password = password;
    }
}
