package com.pharmaxcess_server.pharmaxcess_server.controller;

import com.pharmaxcess_server.pharmaxcess_server.dto.LocationRequest;
import com.pharmaxcess_server.pharmaxcess_server.dto.MachineDTO;
import com.pharmaxcess_server.pharmaxcess_server.dto.NearestMachineRequest;
import com.pharmaxcess_server.pharmaxcess_server.model.Machine;
import com.pharmaxcess_server.pharmaxcess_server.service.MachineService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller for handling operations related to vending machines.
 * Provides endpoints for retrieving all machines, the nearest machines, and generating a machine itinerary.
 */
@RestController
@RequestMapping("/api/machines")
@Tag(name = "Machines routes", description = "Operations related to machines")
public class MachineController {

    private final MachineService machineService;
    private final GeometryFactory geometryFactory = new GeometryFactory();

    /**
     * Constructs a MachineController.
     *
     * @param machineService the service for handling machine operations
     */
    @Autowired
    public MachineController(MachineService machineService) {
        this.machineService = machineService;
    }

    /**
     * Retrieves a list of all vending machines.
     *
     * @return a list of all vending machines
     */
    @GetMapping
    @PreAuthorize("@roleHierarchyUtil.hasSufficientRole(authentication.authorities.iterator().next().authority, 'ROLE_USER')")
    @Operation(
        summary = "Get All Vending Machines",
        description = "Retrieves a list of all vending machines. Requires at least 'ROLE_USER' authority.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "List of vending machines retrieved successfully."),
        @ApiResponse(responseCode = "403", description = "Insufficient permissions."),
        @ApiResponse(responseCode = "500", description = "Internal server error.")
    })
    public List<MachineDTO> getAllMachines() {
        return machineService.getAllMachines();
    }

    /**
     * Retrieves the nearest vending machines based on the user's location.
     *
     * @param body the request body containing the user's latitude and longitude
     * @return a list of the nearest vending machines
     */
    @GetMapping("/nearest")
    @PreAuthorize("@roleHierarchyUtil.hasSufficientRole(authentication.authorities.iterator().next().authority, 'ROLE_USER')")
    @Operation(
        summary = "Get Nearest Vending Machines",
        description = "Retrieves the nearest vending machines based on the user's provided location. Requires at least 'ROLE_USER' authority.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "List of nearest vending machines retrieved successfully."),
        @ApiResponse(responseCode = "400", description = "Invalid request body."),
        @ApiResponse(responseCode = "403", description = "Insufficient permissions."),
        @ApiResponse(responseCode = "500", description = "Internal server error.")
    })
    public List<Machine> getNearestMachines(@RequestBody LocationRequest body) {
        Point userLocation = geometryFactory.createPoint(new Coordinate(body.getLatitude(), body.getLongitude()));
        return machineService.getNearestMachines(userLocation);
    }

    /**
     * Generates a Google Maps link for driving directions from the user's location to a specified vending machine.
     *
     * @param body the request body containing the user's location and the vending machine's ID
     * @return a URL for the driving directions to the specified vending machine
     */
    @GetMapping("/itinary")
    @PreAuthorize("@roleHierarchyUtil.hasSufficientRole(authentication.authorities.iterator().next().authority, 'ROLE_USER')")
    @Operation(
        summary = "Get Machine Itinerary",
        description = "Generates a Google Maps link for driving directions from the user's location to the specified vending machine. Requires 'ROLE_USER' authority.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Itinerary URL generated successfully."),
        @ApiResponse(responseCode = "400", description = "Invalid request body."),
        @ApiResponse(responseCode = "403", description = "Insufficient permissions."),
        @ApiResponse(responseCode = "500", description = "Internal server error.")
    })
    public String getMachineIntinary(@RequestBody NearestMachineRequest body) {
        Point machineLocation = machineService.getMachineLocationById(body.getId());

        return String.format(
            "https://www.google.com/maps/dir/?api=1&origin=%f,%f&destination=%f,%f&travelmode=driving",
            body.getLatitude(), body.getLongitude(),
            machineLocation.getX(), machineLocation.getY()
        );
    }
}