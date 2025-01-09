package com.pharmaxcess_server.pharmaxcess_server.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import com.pharmaxcess_server.pharmaxcess_server.model.TicketMessage;
import com.pharmaxcess_server.pharmaxcess_server.repository.TicketMessageRepository;

public class TicketMessageService {
    @Autowired
    private TicketMessageRepository ticketMessageRepository;

    public List<TicketMessage> getMessagesByTicketId(Integer ticketId) {
        return ticketMessageRepository.findByTicketId(ticketId);
    }
}
