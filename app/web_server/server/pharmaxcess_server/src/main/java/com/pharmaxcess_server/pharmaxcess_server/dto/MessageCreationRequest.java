package com.pharmaxcess_server.pharmaxcess_server.dto;

/**
 * Represents a message creation request containing message content and ticketID
 */
public class MessageCreationRequest {

    private String message;
    private Long ticketID;

    /**
     * Default constructor for the MessageCreationRequest class.
     */
    public MessageCreationRequest() {
    }

    /**
     * Constructor for the MessageCreationRequest class with a message parameter.
     *
     * @param message the message to be set
     */
    public MessageCreationRequest(String message) {
        this.message = message;
    }

    /**
     * Gets the ticket ID associated with the message.
     *
     * @return the ticket ID
     */
    public Long getTicketID() {
        return this.ticketID;
    }

    /**
     * Sets the ticket ID associated with the message.
     *
     * @param ticketID the ticket ID to set
     */
    public void setTicketID(Long ticketID) {
        this.ticketID = ticketID;
    }

    /**
     * Gets the message content.
     *
     * @return the message content
     */
    public String getMessage() {
        return message;
    }

    /**
     * Sets the message content.
     *
     * @param message the message content to set
     */
    public void setMessage(String message) {
        this.message = message;
    }
}