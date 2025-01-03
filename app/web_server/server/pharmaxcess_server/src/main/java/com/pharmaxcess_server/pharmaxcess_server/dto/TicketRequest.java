package com.pharmaxcess_server.pharmaxcess_server.dto;

public class TicketRequest {
    private Long userID;
    private Integer x;
    private Integer y;

    public Long getUserID() {
        return userID;
    }

    public void setUserID(Long userID) {
        this.userID = userID;
    }

    public Integer getX() {
        return x;
    }

    public void setX(Integer x) {
        this.x = x;
    }

    public Integer getY() {
        return y;
    }

    public void setY(Integer y) {
        this.y = y;
    }
}
