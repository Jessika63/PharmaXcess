package com.pharmaxcess_server.pharmaxcess_server.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.pharmaxcess_server.pharmaxcess_server.model.TicketMessage;
import com.pharmaxcess_server.pharmaxcess_server.repository.TicketMessageRepository;

/**
 * Service class for handling ticket message-related operations.
 * <p>
 * This service provides methods to interact with the {@link TicketMessageRepository} for managing
 * messages associated with tickets, including retrieving messages and creating new ones.
 * </p>
 */
@Service
public class TicketMessageService {

    @Autowired
    private TicketMessageRepository ticketMessageRepository;

    /**
     * Retrieves a page of messages for a specific ticket, within a specified range.
     *
     * @param ticketId the ID of the ticket whose messages are being retrieved
     * @param x the starting index of the message page (inclusive)
     * @param y the ending index of the message page (inclusive)
     * @return a list of {@link TicketMessage} objects
     */
    public List<TicketMessage> getMessageTicketPage(Long ticketId, Integer x, Integer y) {
        return ticketMessageRepository.findMessageByTicketIdBetween(ticketId, x, y);
    }

    /**
     * Creates a new message for a ticket with the given content.
     *
     * @param ticketID the ID of the ticket to which the message belongs
     * @param content the content of the message
     * @return the created {@link TicketMessage}
     */
    public TicketMessage createMessage(Long ticketID, String content) {
        TicketMessage message = new TicketMessage();
        message.setTicketId(ticketID);
        message.setMessage(content);
        return ticketMessageRepository.createMessage(message);
    }
}