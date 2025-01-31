package com.pharmaxcess_server.pharmaxcess_server.service;

import com.pharmaxcess_server.pharmaxcess_server.dto.TicketCreationRequest;
import com.pharmaxcess_server.pharmaxcess_server.model.Ticket;
import com.pharmaxcess_server.pharmaxcess_server.repository.TicketRepository;
import com.pharmaxcess_server.pharmaxcess_server.dto.TicketAcceptRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

/**
 * Service class for handling ticket-related operations.
 * <p>
 * This service provides methods to interact with the {@link TicketRepository} for managing tickets
 * including retrieving, creating, and updating tickets.
 * </p>
 */
@Service
public class TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    /**
     * Retrieves a page of tickets for a specific user, within a specified range.
     *
     * @param userId the ID of the user whose tickets are being retrieved
     * @param x the starting index of the ticket page (inclusive)
     * @param y the ending index of the ticket page (inclusive)
     * @return a list of {@link Ticket} objects
     */
    public List<Ticket> getUserIdTicketPage(Long userId, int x, int y) {
        return ticketRepository.findTicketsByUserIdBetween(userId, x, y);
    }

    /**
     * Creates a new ticket based on the given request data.
     *
     * @param ticketCreationRequest the data required to create a new ticket
     * @return the created {@link Ticket}
     */
    public Ticket createTicket(TicketCreationRequest ticketCreationRequest) {
        Ticket ticket = new Ticket();
        ticket.setTitle(ticketCreationRequest.getTitle());
        return ticketRepository.createTicket(ticket);
    }

    /**
     * Accepts a ticket by assigning it to a user.
     *
     * @param ticketAcceptRequest the request containing the ticket ID and user ID
     * @return an {@link Optional} containing the updated {@link Ticket} if the update was successful, otherwise empty
     */
    public Optional<Ticket> acceptTicket(TicketAcceptRequest ticketAcceptRequest) {
        return ticketRepository.updateTicketAssignedTo(ticketAcceptRequest.getUserID(), ticketAcceptRequest.getTicketID());
    }
}