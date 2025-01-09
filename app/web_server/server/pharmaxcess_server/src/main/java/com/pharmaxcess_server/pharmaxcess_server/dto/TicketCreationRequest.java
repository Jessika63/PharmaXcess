package com.pharmaxcess_server.pharmaxcess_server.dto;

public class TicketCreationRequest {
    private String title;

    public TicketCreationRequest() {
    }

    public TicketCreationRequest(String title) {
        this.title = title;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }
}
