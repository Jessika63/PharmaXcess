package com.pharmaxcess_server.pharmaxcess_server.controller;

import com.pharmaxcess_server.pharmaxcess_server.dto.IDDto;
import com.pharmaxcess_server.pharmaxcess_server.model.MedicalHistory;
import com.pharmaxcess_server.pharmaxcess_server.dto.MedicalHistoryCreationRequest;
import com.pharmaxcess_server.pharmaxcess_server.service.MedicalHistoryService;

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
 * REST controller for handling operations related to medicalhistorys.
 * Provides endpoints for retrieving the medicalhistorys.
 */
@RestController
@RequestMapping("/api/medicalhistory")
@Tag(name = "MedicalHistorys routes", description = "Operations related to medicalhistorys")
public class MedicalHistoryController {

    private final MedicalHistoryService medicalhistoryService;

    /**
     * Constructs a MedicalHistoryController.
     *
     * @param medicalhistoryService the service for handling medicalhistory operations
     */
    @Autowired
    public MedicalHistoryController(MedicalHistoryService medicalhistoryService) {
        this.medicalhistoryService = medicalhistoryService;
    }

    /**
     * Retrieves the nearest pharmacy based on the user's location.
     *
     * @return a list of the nearest pharmacy
     */
    @GetMapping("/get")
    @PreAuthorize("@roleHierarchyUtil.hasSufficientRole(authentication.authorities.iterator().next().authority, 'ROLE_USER')")
    @Operation(
        summary = "Get user's medicalhistory",
        description = "Retrieves user's medicalhistorys. Requires at least 'ROLE_USER' authority.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "List of user's medicalhistorys retrieved successfully."),
        @ApiResponse(responseCode = "400", description = "Invalid request body."),
        @ApiResponse(responseCode = "403", description = "Insufficient permissions."),
        @ApiResponse(responseCode = "500", description = "Internal server error.")
    })
    public List<MedicalHistory> getUserMedicalHistory() {
        String token = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getCredentials().toString();

        return medicalhistoryService.getUserMedicalHistory(1);
    }

    /**
     * Creates a new medicalhistory with the specified details.
     *
     * @param body the request body containing the medicalhistory details
     * @return the created medicalhistory
     */
    @PostMapping("/create")
    @Operation(
        summary = "Create an MedicalHistory",
        description = "Creates a new medicalhistory based on the provided details.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "MedicalHistory created successfully."),
        @ApiResponse(responseCode = "400", description = "Invalid request body."),
        @ApiResponse(responseCode = "403", description = "Insufficient permissions."),
        @ApiResponse(responseCode = "500", description = "Internal server error.")
    })
    @PreAuthorize("@roleHierarchyUtil.hasSufficientRole(authentication.authorities.iterator().next().authority, 'ROLE_USER')")
    public int createMedicalHistory(@RequestBody MedicalHistoryCreationRequest body) {
        return medicalhistoryService.createMedicalHistory(body);
    }

        /**
     * Deletes an medicalhistory with the specified details.
     *
     * @param body the request body containing the medicalhistory details
     * @return the created medicalhistory
     */
    @PostMapping("/delete")
    @Operation(
        summary = "Delete an MedicalHistory",
        description = "Deletes a new medicalhistory based on the provided details.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "MedicalHistory created successfully."),
        @ApiResponse(responseCode = "400", description = "Invalid request body."),
        @ApiResponse(responseCode = "403", description = "Insufficient permissions."),
        @ApiResponse(responseCode = "500", description = "Internal server error.")
    })
    @PreAuthorize("@roleHierarchyUtil.hasSufficientRole(authentication.authorities.iterator().next().authority, 'ROLE_USER')")
    public int deleteMedicalHistory(@RequestBody IDDto body) {
        return medicalhistoryService.deleteMedicalHistory(body);
    }
}