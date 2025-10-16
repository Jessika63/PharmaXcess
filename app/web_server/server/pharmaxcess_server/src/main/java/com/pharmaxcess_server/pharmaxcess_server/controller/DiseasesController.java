package com.pharmaxcess_server.pharmaxcess_server.controller;

import com.pharmaxcess_server.pharmaxcess_server.dto.IDDto;
import com.pharmaxcess_server.pharmaxcess_server.model.Disease;
import com.pharmaxcess_server.pharmaxcess_server.dto.DiseaseCreationRequest;
import com.pharmaxcess_server.pharmaxcess_server.service.DiseaseService;

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
 * REST controller for handling operations related to diseasess.
 * Provides endpoints for retrieving the diseasess.
 */
@RestController
@RequestMapping("/api/diseases")
@Tag(name = "Diseasess routes", description = "Operations related to diseasess")
public class DiseasesController {

    private final DiseaseService diseaseService;

    /**
     * Constructs a DiseasesController.
     *
     * @param diseaseService the service for handling diseases operations
     */
    @Autowired
    public DiseasesController(DiseaseService diseaseService) {
        this.diseaseService = diseaseService;
    }

    /**
     * Retrieves the nearest pharmacy based on the user's location.
     *
     * @return a list of the nearest pharmacy
     */
    @GetMapping("/get")
    @PreAuthorize("@roleHierarchyUtil.hasSufficientRole(authentication.authorities.iterator().next().authority, 'ROLE_USER')")
    @Operation(
        summary = "Get user's diseases",
        description = "Retrieves user's diseasess. Requires at least 'ROLE_USER' authority.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "List of user's diseasess retrieved successfully."),
        @ApiResponse(responseCode = "400", description = "Invalid request body."),
        @ApiResponse(responseCode = "403", description = "Insufficient permissions."),
        @ApiResponse(responseCode = "500", description = "Internal server error.")
    })
    public List<Disease> getUserDiseases() {
        //String token = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getCredentials().toString();

        return diseaseService.getUserDisease(1);
    }

    /**
     * Creates a new diseases with the specified details.
     *
     * @param body the request body containing the diseases details
     * @return the created diseases
     */
    @PostMapping("/create")
    @Operation(
        summary = "Create an Diseases",
        description = "Creates a new diseases based on the provided details.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Diseases created successfully."),
        @ApiResponse(responseCode = "400", description = "Invalid request body."),
        @ApiResponse(responseCode = "403", description = "Insufficient permissions."),
        @ApiResponse(responseCode = "500", description = "Internal server error.")
    })
    @PreAuthorize("@roleHierarchyUtil.hasSufficientRole(authentication.authorities.iterator().next().authority, 'ROLE_USER')")
    public int createDiseases(@RequestBody DiseaseCreationRequest body) {
        return diseaseService.createDisease(body);
    }

        /**
     * Deletes an diseases with the specified details.
     *
     * @param body the request body containing the diseases details
     * @return the created diseases
     */
    @PostMapping("/delete")
    @Operation(
        summary = "Delete an Diseases",
        description = "Deletes a new diseases based on the provided details.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Diseases created successfully."),
        @ApiResponse(responseCode = "400", description = "Invalid request body."),
        @ApiResponse(responseCode = "403", description = "Insufficient permissions."),
        @ApiResponse(responseCode = "500", description = "Internal server error.")
    })
    @PreAuthorize("@roleHierarchyUtil.hasSufficientRole(authentication.authorities.iterator().next().authority, 'ROLE_USER')")
    public int deleteDiseases(@RequestBody IDDto body) {
        return diseaseService.deleteDisease(body);
    }
}