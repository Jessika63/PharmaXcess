package com.pharmaxcess_server.pharmaxcess_server.dto;

/**
 * Represents a request to accept a ticket, containing the user ID and ticket ID.
 */
public class TicketAcceptRequest {
    private Long userID;
    private Long ticketID;

    /**
     * Gets the user ID associated with the ticket acceptance request.
     *
     * @return the user ID
     */
    public Long getUserID() {
        return userID;
    }

    /**
     * Sets the user ID associated with the ticket acceptance request.
     *
     * @param userID the user ID to set
     */
    public void setUserID(Long userID) {
        this.userID = userID;
    }

    /**
     * Gets the ticket ID associated with the ticket acceptance request.
     *
     * @return the ticket ID
     */
    public Long getTicketID() {
        return ticketID;
    }

    /**
     * Sets the ticket ID associated with the ticket acceptance request.
     *
     * @param ticketID the ticket ID to set
     */
    public void setTicketID(Long ticketID) {
        this.ticketID = ticketID;
    }
}
