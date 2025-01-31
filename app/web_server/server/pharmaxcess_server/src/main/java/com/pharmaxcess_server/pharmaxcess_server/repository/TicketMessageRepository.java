package com.pharmaxcess_server.pharmaxcess_server.repository;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Repository;
import java.util.Comparator;

import com.pharmaxcess_server.pharmaxcess_server.model.TicketMessage;

/**
 * Repository class for managing {@link TicketMessage} entities.
 */
@Repository
public class TicketMessageRepository {

    /**
     * Retrieves a paginated list of messages for a given ticket, sorted by creation date in descending order.
     *
     * @param ticketId the ID of the ticket
     * @param x        the starting index (1-based)
     * @param y        the ending index (inclusive)
     * @return a list of {@link TicketMessage} between the given indices
     */
    public List<TicketMessage> findMessageByTicketIdBetween(Long ticketId, int x, int y) {
        List<TicketMessage> messages = getAllMessageByTicketId(ticketId);

        return messages.stream()
                .sorted(Comparator.comparing(TicketMessage::getCreatedAt).reversed())
                .skip(x - 1)
                .limit(y - x + 1)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves all messages associated with a given ticket ID.
     * <p>
     * Currently, this method returns an empty list and should be implemented with actual data retrieval logic.
     *
     * @param ticketId the ID of the ticket
     * @return a list of {@link TicketMessage} associated with the ticket
     */
    private List<TicketMessage> getAllMessageByTicketId(Long ticketId) {
        return new ArrayList<>();
    }

    /**
     * Creates and persists a new message.
     * <p>
     * Currently, this method simply returns the provided message object without persisting it.
     *
     * @param message the {@link TicketMessage} to create
     * @return the created {@link TicketMessage}
     */
    public TicketMessage createMessage(TicketMessage message) {
        return message;
    }
}