package com.pharmaxcess_server.pharmaxcess_server.service;

import com.pharmaxcess_server.pharmaxcess_server.model.Ticket;
import com.pharmaxcess_server.pharmaxcess_server.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class TicketService {
    @Autowired
    private TicketRepository ticketRepository;

    public List<Ticket> getUserIdTicketPage(Long userId, int x, int y) {
        return ticketRepository.findTicketsByUserIdBetween(userId, x, y);
    }
}
