package com.pharmaxcess_server.pharmaxcess_server.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.pharmaxcess_server.pharmaxcess_server.dto.LocationRequest;
import com.pharmaxcess_server.pharmaxcess_server.dto.NearestMachineRequest;
import com.pharmaxcess_server.pharmaxcess_server.dto.Pharmacy;
import com.pharmaxcess_server.pharmaxcess_server.service.PharmacyService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller for handling operations related to pharmacies.
 * Provides endpoints for retrieving the nearest pharmacies, and generating a pharmacy itinerary.
 */
@RestController
@RequestMapping("/api/pharmacy")
@Tag(name = "Pharmacies routes", description = "Operations related to pharmacies")
public class PharmacyController {

    private final PharmacyService pharmacyService;

    /**
     * Constructs a PharmacyController.
     *
     * @param pharmacyService the service for handling pharmacy operations
     */
    @Autowired
    public PharmacyController(PharmacyService pharmacyService) {
        this.pharmacyService = pharmacyService;
    }

    /**
     * Retrieves the nearest pharmacy based on the user's location.
     *
     * @param body the request body containing the user's latitude and longitude
     * @return a list of the nearest pharmacy
     */
    @PostMapping("/nearest")
    @PreAuthorize("@roleHierarchyUtil.hasSufficientRole(authentication.authorities.iterator().next().authority, 'ROLE_USER')")
    @Operation(
        summary = "Get Nearest pharmacy",
        description = "Retrieves the nearest pharmacy based on the user's provided location. Requires at least 'ROLE_USER' authority.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "List of nearest pharmacy retrieved successfully."),
        @ApiResponse(responseCode = "400", description = "Invalid request body."),
        @ApiResponse(responseCode = "403", description = "Insufficient permissions."),
        @ApiResponse(responseCode = "500", description = "Internal server error.")
    })
    public List<Pharmacy> getNearestPharmacy(@RequestBody LocationRequest body) {
        return pharmacyService.getNearestPharmacies(body.getLatitude(), body.getLongitude());
    }

    /**
     * Retrieves pharmacy itinary from the user's location.
     *
     * @param body the request body containing the user's latitude and longitude and pharmacy's id
     * @return JsonNode of pharmacy itinary
     */
    @PostMapping("/itinerary")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Itinary of pharmacy retrieved successfully."),
        @ApiResponse(responseCode = "400", description = "Invalid request body."),
        @ApiResponse(responseCode = "403", description = "Insufficient permissions."),
        @ApiResponse(responseCode = "500", description = "Internal server error.")
    })
    public ResponseEntity<JsonNode> getItineraryToPharmacy(@RequestBody NearestMachineRequest body) {
        double userLat = body.getLatitude();
        double userLon = body.getLongitude();

        double[] pharmacyCoords = pharmacyService.getPharmacyCoordinates(body.getId());
        double pharmacyLat = pharmacyCoords[0];
        double pharmacyLon = pharmacyCoords[1];

        JsonNode route = pharmacyService.getItinerary(userLat, userLon, pharmacyLat, pharmacyLon);
        return ResponseEntity.ok(route);
    }
}