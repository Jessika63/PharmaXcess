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

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * REST controller for handling operations related to ticket messages.
 * Provides endpoints for retrieving and creating messages associated with tickets.
 */
@RestController
@RequestMapping("/api/ticket/message")
@Tag(name = "Ticket messages", description = "Operations related to messages in ticket")
public class TicketMessageController {

    private final TicketMessageService ticketMessageService;

    /**
     * Constructs a TicketMessageController.
     *
     * @param ticketMessageService the service for handling ticket message operations
     */
    @Autowired
    public TicketMessageController(TicketMessageService ticketMessageService) {
        this.ticketMessageService = ticketMessageService;
    }

    /**
     * Retrieves a paginated list of messages associated with a specific ticket.
     *
     * @param body the request body containing ticket ID and pagination coordinates
     * @return a list of paginated messages for the specified ticket
     */
    @GetMapping("/message_page")
    @Operation(
        summary = "Get Messages by Page",
        description = "Retrieves a paginated list of messages related to a specific ticket based on the ticket ID and pagination coordinates.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Messages retrieved successfully."),
        @ApiResponse(responseCode = "400", description = "Invalid request body."),
        @ApiResponse(responseCode = "403", description = "Insufficient permissions."),
        @ApiResponse(responseCode = "500", description = "Internal server error.")
    })
    @PreAuthorize("@roleHierarchyUtil.hasSufficientRole(authentication.authorities.iterator().next().authority, 'ROLE_USER')")
    public List<TicketMessage> getMessageByPage(@RequestBody TicketMessageRequest body) {
        return ticketMessageService.getMessageTicketPage(body.getTicketID(), body.getX(), body.getY());
    }

    /**
     * Creates a new message for a specified ticket.
     *
     * @param body the request body containing the ticket ID and message content
     * @return the created ticket message
     */
    @GetMapping("/create")
    @Operation(
        summary = "Create a Message",
        description = "Creates a new message for a specified ticket.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Message created successfully."),
        @ApiResponse(responseCode = "400", description = "Invalid request body."),
        @ApiResponse(responseCode = "403", description = "Insufficient permissions."),
        @ApiResponse(responseCode = "500", description = "Internal server error.")
    })
    @PreAuthorize("@roleHierarchyUtil.hasSufficientRole(authentication.authorities.iterator().next().authority, 'ROLE_USER')")
    public TicketMessage createMessage(@RequestBody MessageCreationRequest body) {
        return ticketMessageService.createMessage(body.getTicketID(), body.getMessage());
    }
}