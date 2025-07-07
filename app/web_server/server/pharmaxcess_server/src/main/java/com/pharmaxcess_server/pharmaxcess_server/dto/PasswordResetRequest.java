package com.pharmaxcess_server.pharmaxcess_server.dto;

/**
 * Contains user email, it's used to reset user password
 */
public class PasswordResetRequest {
    private String email;

    /**
     * Gets the email of the user.
     *
     * @return the email of the user
     */
    public String getEmail() { return email; }

    /**
     * Sets the email of the user.
     *
     * @param email the email of the user
     */
    public void setEmail(String email) { this.email = email; }
}
