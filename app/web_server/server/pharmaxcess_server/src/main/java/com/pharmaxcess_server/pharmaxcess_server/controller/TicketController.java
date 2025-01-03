package com.pharmaxcess_server.pharmaxcess_server.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.neo4j.Neo4jProperties.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pharmaxcess_server.pharmaxcess_server.dto.TicketRequest;
import com.pharmaxcess_server.pharmaxcess_server.model.Ticket;
import com.pharmaxcess_server.pharmaxcess_server.service.TicketService;

@RestController
@RequestMapping("/api/ticket")
public class TicketController {
    private final TicketService ticketService;

    @Autowired
    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping("/ticket_page")
    @PreAuthorize("@roleHierarchyUtil.hasSufficientRole(authentication.authorities.iterator().next().authority, 'ROLE_USER')")
    public List<Ticket> getTicketByPage(@RequestBody TicketRequest body) {
        return ticketService.getUserIdTicketPage(body.getUserID(), body.getX(), body.getY());
    }
}
