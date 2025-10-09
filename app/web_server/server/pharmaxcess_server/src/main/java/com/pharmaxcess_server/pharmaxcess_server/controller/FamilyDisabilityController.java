package com.pharmaxcess_server.pharmaxcess_server.controller;

import com.pharmaxcess_server.pharmaxcess_server.dto.IDDto;
import com.pharmaxcess_server.pharmaxcess_server.model.FamilyDisability;
import com.pharmaxcess_server.pharmaxcess_server.dto.FamilyDisabilityCreationRequest;
import com.pharmaxcess_server.pharmaxcess_server.service.FamilyDisabilityService;

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
 * REST controller for handling operations related to familydisabilitys.
 * Provides endpoints for retrieving the familydisabilitys.
 */
@RestController
@RequestMapping("/api/familydisability")
@Tag(name = "FamilyDisabilitys routes", description = "Operations related to familydisabilitys")
public class FamilyDisabilityController {

    private final FamilyDisabilityService familydisabilityService;

    /**
     * Constructs a FamilyDisabilityController.
     *
     * @param familydisabilityService the service for handling familydisability operations
     */
    @Autowired
    public FamilyDisabilityController(FamilyDisabilityService familydisabilityService) {
        this.familydisabilityService = familydisabilityService;
    }

    /**
     * Retrieves the nearest pharmacy based on the user's location.
     *
     * @return a list of the nearest pharmacy
     */
    @GetMapping("/get")
    @PreAuthorize("@roleHierarchyUtil.hasSufficientRole(authentication.authorities.iterator().next().authority, 'ROLE_USER')")
    @Operation(
        summary = "Get user's familydisability",
        description = "Retrieves user's familydisabilitys. Requires at least 'ROLE_USER' authority.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "List of user's familydisabilitys retrieved successfully."),
        @ApiResponse(responseCode = "400", description = "Invalid request body."),
        @ApiResponse(responseCode = "403", description = "Insufficient permissions."),
        @ApiResponse(responseCode = "500", description = "Internal server error.")
    })
    public List<FamilyDisability> getUserFamilyDisability() {
        String token = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getCredentials().toString();

        return familydisabilityService.getUserFamilyDisability(1);
    }

    /**
     * Creates a new familydisability with the specified details.
     *
     * @param body the request body containing the familydisability details
     * @return the created familydisability
     */
    @PostMapping("/create")
    @Operation(
        summary = "Create an FamilyDisability",
        description = "Creates a new familydisability based on the provided details.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "FamilyDisability created successfully."),
        @ApiResponse(responseCode = "400", description = "Invalid request body."),
        @ApiResponse(responseCode = "403", description = "Insufficient permissions."),
        @ApiResponse(responseCode = "500", description = "Internal server error.")
    })
    @PreAuthorize("@roleHierarchyUtil.hasSufficientRole(authentication.authorities.iterator().next().authority, 'ROLE_USER')")
    public int createFamilyDisability(@RequestBody FamilyDisabilityCreationRequest body) {
        return familydisabilityService.createFamilyDisability(body);
    }

        /**
     * Deletes an familydisability with the specified details.
     *
     * @param body the request body containing the familydisability details
     * @return the created familydisability
     */
    @PostMapping("/delete")
    @Operation(
        summary = "Delete an FamilyDisability",
        description = "Deletes a new familydisability based on the provided details.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "FamilyDisability created successfully."),
        @ApiResponse(responseCode = "400", description = "Invalid request body."),
        @ApiResponse(responseCode = "403", description = "Insufficient permissions."),
        @ApiResponse(responseCode = "500", description = "Internal server error.")
    })
    @PreAuthorize("@roleHierarchyUtil.hasSufficientRole(authentication.authorities.iterator().next().authority, 'ROLE_USER')")
    public int deleteFamilyDisability(@RequestBody IDDto body) {
        return familydisabilityService.deleteFamilyDisability(body);
    }
}