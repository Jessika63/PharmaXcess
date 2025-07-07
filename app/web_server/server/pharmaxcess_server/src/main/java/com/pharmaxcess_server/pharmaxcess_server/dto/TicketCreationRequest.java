package com.pharmaxcess_server.pharmaxcess_server.dto;

/**
 * The TicketCreationRequest class represents a request to create a ticket with a specified title.
 * It provides constructors to initialize the title and getter and setter methods to access and modify the title.
 */
public class TicketCreationRequest {

    private String title;

    /**
     * Default constructor for TicketCreationRequest.
     */
    public TicketCreationRequest() {
    }

    /**
     * Constructor for TicketCreationRequest with a specified title.
     *
     * @param title the title of the ticket
     */
    public TicketCreationRequest(String title) {
        this.title = title;
    }

    /**
     * Gets the title of the ticket.
     *
     * @return the title of the ticket
     */
    public String getTitle() {
        return title;
    }

    /**
     * Sets the title of the ticket.
     *
     * @param title the title to set for the ticket
     */
    public void setTitle(String title) {
        this.title = title;
    }
}