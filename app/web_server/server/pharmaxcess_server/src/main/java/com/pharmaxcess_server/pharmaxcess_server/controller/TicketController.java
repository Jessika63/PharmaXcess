package com.pharmaxcess_server.pharmaxcess_server.controller;

import java.security.Principal;
import java.util.List;
import java.util.Optional;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
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

import com.pharmaxcess_server.pharmaxcess_server.service.UserService;
import com.pharmaxcess_server.pharmaxcess_server.model.User;


import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.PostMapping;

@RestController
@RequestMapping("/api/ticket")
@Tag(name = "Ticket routes", description = "Operations related to tickets")
public class TicketController {
    private final TicketService ticketService;
    private final UserService userService;

    @Autowired
    public TicketController(TicketService ticketService, UserService userService) {
        this.ticketService = ticketService;
        this.userService = userService;
    }

    @GetMapping("/ticket_page")
    @Operation(
        summary = "Get Tickets by Page",
        description = "Retrieves a paginated list of tickets for a user, based on the user's ID and pagination coordinates.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Tickets retrieved successfully."),
        @ApiResponse(responseCode = "400", description = "Invalid request body."),
        @ApiResponse(responseCode = "403", description = "Insufficient permissions."),
        @ApiResponse(responseCode = "500", description = "Internal server error.")
    })
    @PreAuthorize("@roleHierarchyUtil.hasSufficientRole(authentication.authorities.iterator().next().authority, 'ROLE_USER')")
    public List<Ticket> getTicketByPage(@RequestBody TicketRequest body, @AuthenticationPrincipal Principal principal) {
        String userEmail = principal.getName();

        Optional<User> user = userService.findByEmail(userEmail);

        if (user.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        return ticketService.getUserIdTicketPage(user.get().getId(), body.getX(), body.getY());
    }

    @PostMapping("/create")
    @Operation(
        summary = "Create a Ticket",
        description = "Creates a new ticket based on the provided details.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Ticket created successfully."),
        @ApiResponse(responseCode = "400", description = "Invalid request body."),
        @ApiResponse(responseCode = "403", description = "Insufficient permissions."),
        @ApiResponse(responseCode = "500", description = "Internal server error.")
    })
    @PreAuthorize("@roleHierarchyUtil.hasSufficientRole(authentication.authorities.iterator().next().authority, 'ROLE_USER')")
    public Ticket createTicket(@RequestBody TicketCreationRequest body) {
        return ticketService.createTicket(body);
    }

    @PostMapping("/accept")
    @Operation(
        summary = "Accept a Ticket",
        description = "Allows a medic to accept a ticket based on the provided request data.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Ticket accepted successfully."),
        @ApiResponse(responseCode = "400", description = "Invalid request body."),
        @ApiResponse(responseCode = "403", description = "Insufficient permissions."),
        @ApiResponse(responseCode = "500", description = "Internal server error.")
    })
    @PreAuthorize("@roleHierarchyUtil.hasSufficientRole(authentication.authorities.iterator().next().authority, 'ROLE_MEDIC')")
    public Optional<Ticket> acceptTicket(@RequestBody TicketAcceptRequest body) {
        return ticketService.acceptTicket(body);
    }
}
