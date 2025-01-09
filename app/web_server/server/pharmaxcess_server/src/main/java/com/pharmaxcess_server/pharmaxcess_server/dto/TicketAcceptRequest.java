package com.pharmaxcess_server.pharmaxcess_server.dto;

public class TicketAcceptRequest {
    private Long userID;
    private Long ticketID;

    public Long getUserID() {
        return userID;
    }

    public void setUserID(Long userID) {
        this.userID = userID;
    }

    public Long getTicketID() {
        return ticketID;
    }

    public void setTicketID(Long ticketID) {
        this.ticketID = ticketID;
    }
}
