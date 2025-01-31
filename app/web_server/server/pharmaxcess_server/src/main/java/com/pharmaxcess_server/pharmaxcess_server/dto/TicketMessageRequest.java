package com.pharmaxcess_server.pharmaxcess_server.dto;

/**
 * The TicketMessageRequest class represents a request to send a message related to a ticket.
 * It contains the ticket ID and coordinates (x, y) for the message.
 */
public class TicketMessageRequest {
    private Long ticketID;
    private Integer x;
    private Integer y;

    /**
     * Gets the ticket ID.
     *
     * @return the ticket ID
     */
    public Long getTicketID() {
        return ticketID;
    }

    /**
     * Sets the ticket ID.
     *
     * @param ticketID the ticket ID to set
     */
    public void setTicketID(Long ticketID) {
        this.ticketID = ticketID;
    }

    /**
     * Gets the value of x.
     *
     * @return the value of x
     */
    public Integer getX() {
        return x;
    }

    /**
     * Sets the value of x.
     *
     * @param x the value to set for x
     */
    public void setX(Integer x) {
        this.x = x;
    }

    /**
     * Gets the value of y.
     *
     * @return the value of y
     */
    public Integer getY() {
        return y;
    }

    /**
     * Sets the value of y.
     *
     * @param y the value to set for y
     */
    public void setY(Integer y) {
        this.y = y;
    }
}
