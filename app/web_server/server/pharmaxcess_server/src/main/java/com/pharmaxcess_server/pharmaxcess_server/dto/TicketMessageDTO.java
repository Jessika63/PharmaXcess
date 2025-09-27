package com.pharmaxcess_server.pharmaxcess_server.dto;

import com.pharmaxcess_server.pharmaxcess_server.Model.TicketMessage;

/**
 * The TicketMessage class represents tickets with their messages.
 * It contains the ticket ID and every messages.
 */
public class TicketMessageDTO {
    private Long ticketID;
    private List<TicketMessage> messages;

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
     * Gets the list of messages.
     *
     * @return the list of messages
     */
    public List<TicketMessage> getMessages() {
        return messages;
    }

    /**
     * Sets the list of messages.
     *
     * @param messages the list of messages to set
     */
    public void setMessages(List<TicketMessage> messages) {
        this.messages = messages;
    }
}
