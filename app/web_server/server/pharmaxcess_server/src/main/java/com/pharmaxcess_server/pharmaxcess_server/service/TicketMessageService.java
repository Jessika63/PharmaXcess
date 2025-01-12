package com.pharmaxcess_server.pharmaxcess_server.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.pharmaxcess_server.pharmaxcess_server.model.TicketMessage;
import com.pharmaxcess_server.pharmaxcess_server.repository.TicketMessageRepository;

@Service
public class TicketMessageService {
    @Autowired
    private TicketMessageRepository ticketMessageRepository;

    public List<TicketMessage> getMessageTicketPage(Long ticketId, Integer x, Integer y) {
        return ticketMessageRepository.findMessageByTicketIdBetween(ticketId, x, y);
    }

    public TicketMessage createMessage(Long ticketID, String content) {
        TicketMessage message = new TicketMessage();

        message.setTicketId(ticketID);
        message.setMessage(content);
        return ticketMessageRepository.createMessage(message);
    }
}
