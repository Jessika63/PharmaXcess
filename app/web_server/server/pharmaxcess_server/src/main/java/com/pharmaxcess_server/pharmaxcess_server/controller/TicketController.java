package com.pharmaxcess_server.pharmaxcess_server.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pharmaxcess_server.pharmaxcess_server.dto.TicketRequest;
import com.pharmaxcess_server.pharmaxcess_server.dto.TicketCreationRequest;
import com.pharmaxcess_server.pharmaxcess_server.dto.TicketAcceptRequest;
import com.pharmaxcess_server.pharmaxcess_server.model.Ticket;
import com.pharmaxcess_server.pharmaxcess_server.service.TicketService;
import org.springframework.web.bind.annotation.PostMapping;

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

    @PostMapping("/create")
    @PreAuthorize("@roleHierarchyUtil.hasSufficientRole(authentication.authorities.iterator().next().authority, 'ROLE_USER')")
    public Ticket createTicket(@RequestBody TicketCreationRequest body) {
        return ticketService.createTicket(body);
    }

    @PostMapping("/accept")
    @PreAuthorize("@roleHierarchyUtil.hasSufficientRole(authentication.authorities.iterator().next().authority, 'ROLE_MEDIC')")
    public Optional<Ticket> acceptTicket(@RequestBody TicketAcceptRequest body) {
        return ticketService.acceptTicket(body);
    }
}
