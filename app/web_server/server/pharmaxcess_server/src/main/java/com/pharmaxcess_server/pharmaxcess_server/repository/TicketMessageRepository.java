package com.pharmaxcess_server.pharmaxcess_server.repository;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Repository;
import java.util.Comparator;

import com.pharmaxcess_server.pharmaxcess_server.model.TicketMessage;

@Repository
public class TicketMessageRepository {
    public List<TicketMessage> findMessageByTicketIdBetween(Long ticketId, int x, int y) {
        List<TicketMessage> messages = getAllMessageByTicketId(ticketId);

        return messages.stream()
                  .sorted(Comparator.comparing(TicketMessage::getCreatedAt).reversed())
                  .skip(x - 1)
                  .limit(y - x + 1)
                  .collect(Collectors.toList());
    }

    private List<TicketMessage> getAllMessageByTicketId(Long ticketId) {
        return new ArrayList<>();
    }

    public TicketMessage createMessage(TicketMessage message) {
        return message;
    }
}
