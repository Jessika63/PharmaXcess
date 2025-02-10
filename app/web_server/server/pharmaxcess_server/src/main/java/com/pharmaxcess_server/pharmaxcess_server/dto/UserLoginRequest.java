package com.pharmaxcess_server.pharmaxcess_server.dto;

public class UserLoginRequest {
    private String Email;
    private String Password;

    public String getUsername() {
        return this.Email;
    }

    public void setEmail(String email) {
        this.Email = email;
    }

    public String getPassword() {
        return this.Password;
    }

    public void setPassword(String password) {
        this.Password = password;
    }
}
