package com.pharmaxcess_server.pharmaxcess_server.controller;

import com.pharmaxcess_server.pharmaxcess_server.dto.IDDto;
import com.pharmaxcess_server.pharmaxcess_server.model.Ordonnance;
import com.pharmaxcess_server.pharmaxcess_server.dto.OrdonnanceCreationRequest;
import com.pharmaxcess_server.pharmaxcess_server.service.OrdonnanceService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller for handling operations related to ordonnances.
 * Provides endpoints for retrieving the ordonnances.
 */
@RestController
@RequestMapping("/api/ordonnance")
@Tag(name = "Ordonnances routes", description = "Operations related to ordonnances")
public class OrdonnanceController {

    private final OrdonnanceService ordonnanceService;

    /**
     * Constructs a OrdonnanceController.
     *
     * @param ordonnanceService the service for handling ordonnance operations
     */
    @Autowired
    public OrdonnanceController(OrdonnanceService ordonnanceService) {
        this.ordonnanceService = ordonnanceService;
    }

    /**
     * Retrieves the nearest pharmacy based on the user's location.
     *
     * @return a list of the nearest pharmacy
     */
    @GetMapping("/get")
    @PreAuthorize("@roleHierarchyUtil.hasSufficientRole(authentication.authorities.iterator().next().authority, 'ROLE_USER')")
    @Operation(
        summary = "Get user's ordonnance",
        description = "Retrieves user's ordonnances. Requires at least 'ROLE_USER' authority.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "List of user's ordonnances retrieved successfully."),
        @ApiResponse(responseCode = "400", description = "Invalid request body."),
        @ApiResponse(responseCode = "403", description = "Insufficient permissions."),
        @ApiResponse(responseCode = "500", description = "Internal server error.")
    })
    public List<Ordonnance> getUserOrdonnance() {
        String token = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getCredentials().toString();

        return ordonnanceService.getUserOrdonnance(1);
    }

    /**
     * Creates a new ordonnance with the specified details.
     *
     * @param body the request body containing the ordonnance details
     * @return the created ordonnance
     */
    @PostMapping("/create")
    @Operation(
        summary = "Create an Ordonnance",
        description = "Creates a new ordonnance based on the provided details.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Ordonnance created successfully."),
        @ApiResponse(responseCode = "400", description = "Invalid request body."),
        @ApiResponse(responseCode = "403", description = "Insufficient permissions."),
        @ApiResponse(responseCode = "500", description = "Internal server error.")
    })
    @PreAuthorize("@roleHierarchyUtil.hasSufficientRole(authentication.authorities.iterator().next().authority, 'ROLE_USER')")
    public int createOrdonnance(@RequestBody OrdonnanceCreationRequest body) {
        return ordonnanceService.createOrdonnance(body);
    }

        /**
     * Deletes an ordonnance with the specified details.
     *
     * @param body the request body containing the ordonnance details
     * @return the created ordonnance
     */
    @PostMapping("/delete")
    @Operation(
        summary = "Delete an Ordonnance",
        description = "Deletes a new ordonnance based on the provided details.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Ordonnance created successfully."),
        @ApiResponse(responseCode = "400", description = "Invalid request body."),
        @ApiResponse(responseCode = "403", description = "Insufficient permissions."),
        @ApiResponse(responseCode = "500", description = "Internal server error.")
    })
    @PreAuthorize("@roleHierarchyUtil.hasSufficientRole(authentication.authorities.iterator().next().authority, 'ROLE_USER')")
    public int deleteOrdonnance(@RequestBody IDDto body) {
        return ordonnanceService.deleteOrdonnance(body);
    }
}