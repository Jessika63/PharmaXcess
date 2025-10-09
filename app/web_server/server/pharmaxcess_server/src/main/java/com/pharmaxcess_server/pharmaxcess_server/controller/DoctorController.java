package com.pharmaxcess_server.pharmaxcess_server.controller;

import com.pharmaxcess_server.pharmaxcess_server.dto.IDDto;
import com.pharmaxcess_server.pharmaxcess_server.model.Doctor;
import com.pharmaxcess_server.pharmaxcess_server.dto.DoctorCreationRequest;
import com.pharmaxcess_server.pharmaxcess_server.service.DoctorService;

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
 * REST controller for handling operations related to doctors.
 * Provides endpoints for retrieving the doctors.
 */
@RestController
@RequestMapping("/api/doctor")
@Tag(name = "Doctors routes", description = "Operations related to doctors")
public class DoctorController {

    private final DoctorService doctorService;

    /**
     * Constructs a DoctorController.
     *
     * @param doctorService the service for handling doctor operations
     */
    @Autowired
    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    /**
     * Retrieves the nearest pharmacy based on the user's location.
     *
     * @return a list of the nearest pharmacy
     */
    @GetMapping("/get")
    @PreAuthorize("@roleHierarchyUtil.hasSufficientRole(authentication.authorities.iterator().next().authority, 'ROLE_USER')")
    @Operation(
        summary = "Get user's doctor",
        description = "Retrieves user's doctors. Requires at least 'ROLE_USER' authority.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "List of user's doctors retrieved successfully."),
        @ApiResponse(responseCode = "400", description = "Invalid request body."),
        @ApiResponse(responseCode = "403", description = "Insufficient permissions."),
        @ApiResponse(responseCode = "500", description = "Internal server error.")
    })
    public List<Doctor> getUserDoctor() {
        return doctorService.getDoctor();
    }

    /**
     * Creates a new doctor with the specified details.
     *
     * @param body the request body containing the doctor details
     * @return the created doctor
     */
    @PostMapping("/create")
    @Operation(
        summary = "Create an Doctor",
        description = "Creates a new doctor based on the provided details.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Doctor created successfully."),
        @ApiResponse(responseCode = "400", description = "Invalid request body."),
        @ApiResponse(responseCode = "403", description = "Insufficient permissions."),
        @ApiResponse(responseCode = "500", description = "Internal server error.")
    })
    @PreAuthorize("@roleHierarchyUtil.hasSufficientRole(authentication.authorities.iterator().next().authority, 'ROLE_USER')")
    public int createDoctor(@RequestBody DoctorCreationRequest body) {
        return doctorService.createDoctor(body);
    }

        /**
     * Deletes an doctor with the specified details.
     *
     * @param body the request body containing the doctor details
     * @return the created doctor
     */
    @PostMapping("/delete")
    @Operation(
        summary = "Delete an Doctor",
        description = "Deletes a new doctor based on the provided details.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Doctor created successfully."),
        @ApiResponse(responseCode = "400", description = "Invalid request body."),
        @ApiResponse(responseCode = "403", description = "Insufficient permissions."),
        @ApiResponse(responseCode = "500", description = "Internal server error.")
    })
    @PreAuthorize("@roleHierarchyUtil.hasSufficientRole(authentication.authorities.iterator().next().authority, 'ROLE_USER')")
    public int deleteDoctor(@RequestBody IDDto body) {
        return doctorService.deleteDoctor(body);
    }
}