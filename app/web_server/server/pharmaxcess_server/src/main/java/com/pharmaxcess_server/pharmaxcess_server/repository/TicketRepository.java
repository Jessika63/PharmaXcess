package com.pharmaxcess_server.pharmaxcess_server.repository;

import java.util.Optional;
import com.pharmaxcess_server.pharmaxcess_server.model.Ticket;
import org.springframework.stereotype.Repository;

import java.util.Comparator;
import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Repository
public class TicketRepository {

    public Optional<Ticket> getTicketById(Long id) {
        return Optional.empty();
    }

    public Ticket createTicket(Ticket ticket) {
        return ticket;
    }

    public Optional<Ticket> updateTicketAssignedTo(Long id, Long assignedTo) {
        Optional<Ticket> ticketOptional = getTicketById(id);

        if (ticketOptional.isPresent()) {
            Ticket ticket = ticketOptional.get();

            ticket.setAssignedTo(assignedTo);
            return Optional.of(ticket);
        }
        return Optional.empty();
    }

    public Optional<Ticket> updateTicketStatus(Long id, String status) {
        Optional<Ticket> ticketOptional = getTicketById(id);
        if (ticketOptional.isPresent()) {
            Ticket ticket = ticketOptional.get();
            ticket.setStatus(status);
            return Optional.of(ticket);
        }
        return Optional.empty();
    }

    public List<Ticket> findTicketsByUserIdBetween(Long userId, int x, int y) {
        List<Ticket> tickets = getAllTicketsByUserId(userId);

        return tickets.stream()
                  .sorted(Comparator.comparing(Ticket::getCreatedAt).reversed())
                  .skip(x - 1)
                  .limit(y - x + 1)
                  .collect(Collectors.toList());
    }

    private List<Ticket> getAllTicketsByUserId(Long userId) {
        return new ArrayList<>();
    }
}
