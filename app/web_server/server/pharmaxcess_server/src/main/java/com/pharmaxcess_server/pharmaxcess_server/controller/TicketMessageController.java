package com.pharmaxcess_server.pharmaxcess_server.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pharmaxcess_server.pharmaxcess_server.dto.TicketMessageRequest;
import com.pharmaxcess_server.pharmaxcess_server.dto.MessageCreationRequest;
import com.pharmaxcess_server.pharmaxcess_server.model.TicketMessage;
import com.pharmaxcess_server.pharmaxcess_server.service.TicketMessageService;

@RestController
@RequestMapping("/api/ticket/message")
public class TicketMessageController {
    private final TicketMessageService ticketMessageService;

    @Autowired
    public TicketMessageController(TicketMessageService ticketMessageService) {
        this.ticketMessageService = ticketMessageService;
    }

    @GetMapping("/message_page")
    @PreAuthorize("@roleHierarchyUtil.hasSufficientRole(authentication.authorities.iterator().next().authority, 'ROLE_USER')")
    public List<TicketMessage> getMessageByPage(@RequestBody TicketMessageRequest body) {
        return ticketMessageService.getMessageTicketPage(body.getTicketID(), body.getX(), body.getY());
    }

    @GetMapping("/create")
    @PreAuthorize("@roleHierarchyUtil.hasSufficientRole(authentication.authorities.iterator().next().authority, 'ROLE_USER')")
    public TicketMessage createMessage(@RequestBody MessageCreationRequest body) {
        return ticketMessageService.createMessage(body.getTicketID(), body.getMessage());
    }
}
