package com.pharmaxcess_server.pharmaxcess_server.controller;

import com.pharmaxcess_server.pharmaxcess_server.dto.IDDto;
import com.pharmaxcess_server.pharmaxcess_server.model.Allergy;
import com.pharmaxcess_server.pharmaxcess_server.dto.AllergyCreationRequest;
import com.pharmaxcess_server.pharmaxcess_server.service.AllergyService;

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
 * REST controller for handling operations related to allergiess.
 * Provides endpoints for retrieving the allergiess.
 */
@RestController
@RequestMapping("/api/allergies")
@Tag(name = "Allergiess routes", description = "Operations related to allergiess")
public class AllergiesController {

    private final AllergyService allergiesService;

    /**
     * Constructs a AllergiesController.
     *
     * @param allergiesService the service for handling allergies operations
     */
    @Autowired
    public AllergiesController(AllergyService allergiesService) {
        this.allergiesService = allergiesService;
    }

    /**
     * Retrieves the nearest pharmacy based on the user's location.
     *
     * @return a list of the nearest pharmacy
     */
    @GetMapping("/get")
    @PreAuthorize("@roleHierarchyUtil.hasSufficientRole(authentication.authorities.iterator().next().authority, 'ROLE_USER')")
    @Operation(
        summary = "Get user's allergies",
        description = "Retrieves user's allergiess. Requires at least 'ROLE_USER' authority.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "List of user's allergiess retrieved successfully."),
        @ApiResponse(responseCode = "400", description = "Invalid request body."),
        @ApiResponse(responseCode = "403", description = "Insufficient permissions."),
        @ApiResponse(responseCode = "500", description = "Internal server error.")
    })
    public List<Allergy> getUserAllergies() {
        //String token = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getCredentials().toString();

        return allergiesService.getUserAllergy(1);
    }

    /**
     * Creates a new allergies with the specified details.
     *
     * @param body the request body containing the allergies details
     * @return the created allergies
     */
    @PostMapping("/create")
    @Operation(
        summary = "Create an Allergies",
        description = "Creates a new allergies based on the provided details.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Allergies created successfully."),
        @ApiResponse(responseCode = "400", description = "Invalid request body."),
        @ApiResponse(responseCode = "403", description = "Insufficient permissions."),
        @ApiResponse(responseCode = "500", description = "Internal server error.")
    })
    @PreAuthorize("@roleHierarchyUtil.hasSufficientRole(authentication.authorities.iterator().next().authority, 'ROLE_USER')")
    public int createAllergies(@RequestBody AllergyCreationRequest body) {
        return allergiesService.createAllergy(body);
    }

        /**
     * Deletes an allergies with the specified details.
     *
     * @param body the request body containing the allergies details
     * @return the created allergies
     */
    @PostMapping("/delete")
    @Operation(
        summary = "Delete an Allergies",
        description = "Deletes a new allergies based on the provided details.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Allergies created successfully."),
        @ApiResponse(responseCode = "400", description = "Invalid request body."),
        @ApiResponse(responseCode = "403", description = "Insufficient permissions."),
        @ApiResponse(responseCode = "500", description = "Internal server error.")
    })
    @PreAuthorize("@roleHierarchyUtil.hasSufficientRole(authentication.authorities.iterator().next().authority, 'ROLE_USER')")
    public int deleteAllergies(@RequestBody IDDto body) {
        return allergiesService.deleteAllergy(body);
    }
}