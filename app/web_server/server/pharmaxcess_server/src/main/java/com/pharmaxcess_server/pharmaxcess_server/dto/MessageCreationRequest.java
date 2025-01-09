package com.pharmaxcess_server.pharmaxcess_server.dto;

public class MessageCreationRequest {
    private String message;
    private Long ticketID;

    public MessageCreationRequest() {
    }

    public MessageCreationRequest(String message) {
        this.message = message;
    }

    public Long getTicketID() {
        return this.ticketID;
    }

    public void setTicketID(Long ticketID) {
        this.ticketID = ticketID;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
