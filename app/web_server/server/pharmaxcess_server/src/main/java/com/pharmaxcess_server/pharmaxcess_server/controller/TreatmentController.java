package com.pharmaxcess_server.pharmaxcess_server.controller;

import com.pharmaxcess_server.pharmaxcess_server.dto.IDDto;
import com.pharmaxcess_server.pharmaxcess_server.model.Treatment;
import com.pharmaxcess_server.pharmaxcess_server.dto.TreatmentCreationRequest;
import com.pharmaxcess_server.pharmaxcess_server.service.TreatmentService;

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
 * REST controller for handling operations related to treatments.
 * Provides endpoints for retrieving the treatments.
 */
@RestController
@RequestMapping("/api/treatment")
@Tag(name = "Treatments routes", description = "Operations related to treatments")
public class TreatmentController {

    private final TreatmentService treatmentService;

    /**
     * Constructs a TreatmentController.
     *
     * @param treatmentService the service for handling treatment operations
     */
    @Autowired
    public TreatmentController(TreatmentService treatmentService) {
        this.treatmentService = treatmentService;
    }

    /**
     * Retrieves the nearest pharmacy based on the user's location.
     *
     * @return a list of the nearest pharmacy
     */
    @GetMapping("/get")
    @PreAuthorize("@roleHierarchyUtil.hasSufficientRole(authentication.authorities.iterator().next().authority, 'ROLE_USER')")
    @Operation(
        summary = "Get user's treatment",
        description = "Retrieves user's treatments. Requires at least 'ROLE_USER' authority.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "List of user's treatments retrieved successfully."),
        @ApiResponse(responseCode = "400", description = "Invalid request body."),
        @ApiResponse(responseCode = "403", description = "Insufficient permissions."),
        @ApiResponse(responseCode = "500", description = "Internal server error.")
    })
    public List<Treatment> getUserTreatment() {
        //String token = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getCredentials().toString();

        return treatmentService.getUserTreatment(1);
    }

    /**
     * Creates a new treatment with the specified details.
     *
     * @param body the request body containing the treatment details
     * @return the created treatment
     */
    @PostMapping("/create")
    @Operation(
        summary = "Create an Treatment",
        description = "Creates a new treatment based on the provided details.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Treatment created successfully."),
        @ApiResponse(responseCode = "400", description = "Invalid request body."),
        @ApiResponse(responseCode = "403", description = "Insufficient permissions."),
        @ApiResponse(responseCode = "500", description = "Internal server error.")
    })
    @PreAuthorize("@roleHierarchyUtil.hasSufficientRole(authentication.authorities.iterator().next().authority, 'ROLE_USER')")
    public int createTreatment(@RequestBody TreatmentCreationRequest body) {
        return treatmentService.createTreatment(body);
    }

        /**
     * Deletes an treatment with the specified details.
     *
     * @param body the request body containing the treatment details
     * @return the created treatment
     */
    @PostMapping("/delete")
    @Operation(
        summary = "Delete an Treatment",
        description = "Deletes a new treatment based on the provided details.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Treatment created successfully."),
        @ApiResponse(responseCode = "400", description = "Invalid request body."),
        @ApiResponse(responseCode = "403", description = "Insufficient permissions."),
        @ApiResponse(responseCode = "500", description = "Internal server error.")
    })
    @PreAuthorize("@roleHierarchyUtil.hasSufficientRole(authentication.authorities.iterator().next().authority, 'ROLE_USER')")
    public int deleteTreatment(@RequestBody IDDto body) {
        return treatmentService.deleteTreatment(body);
    }
}