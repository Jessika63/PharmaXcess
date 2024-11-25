package com.pharmaxcess_server.pharmaxcess_server.dto;

public class UserRegisterRequest {
    private String Email;
    private String Username;

    public String getEmail() {
        return this.Email;
    }

    public void setEmail(String email) {
        this.Email = email;
    }

    public String getUsername() {
        return this.Username;
    }

    public void setUsername(String username) {
        this.Username = username;
    }
}
