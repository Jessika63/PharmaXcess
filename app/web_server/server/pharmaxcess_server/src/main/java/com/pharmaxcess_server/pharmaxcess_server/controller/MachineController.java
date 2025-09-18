package com.pharmaxcess_server.pharmaxcess_server.controller;

import com.pharmaxcess_server.pharmaxcess_server.dto.LocationRequest;
import com.pharmaxcess_server.pharmaxcess_server.dto.MachineDTO;
import com.pharmaxcess_server.pharmaxcess_server.dto.NearestMachineRequest;
import com.pharmaxcess_server.pharmaxcess_server.service.MachineService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
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

    private final RestTemplate restTemplate = new RestTemplate();
    private final MachineService machineService;
    private final GeometryFactory geometryFactory = new GeometryFactory();
    private static final String SECRET = System.getenv("ORS_API_KEY");

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
    @PostMapping("/nearest")
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
    public List<Object[]> getNearestMachines(@RequestBody LocationRequest body) {
        Point userLocation = geometryFactory.createPoint(new Coordinate(body.getLatitude(), body.getLongitude()));
        return machineService.getNearestMachines(userLocation);
    }

    /**
     * Generates a ORS Maps link for driving directions from the user's location to a specified vending machine.
     *
     * @param body the request body containing the user's location and the vending machine's ID
     * @return a URL for the driving directions to the specified vending machine
     */
    @PostMapping("/itinary")
    @PreAuthorize("@roleHierarchyUtil.hasSufficientRole(authentication.authorities.iterator().next().authority, 'ROLE_USER')")
    @Operation(
        summary = "Get Machine Itinerary",
        description = "Generates a ORS Maps link for driving directions from the user's location to the specified vending machine. Requires 'ROLE_USER' authority.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Itinerary URL generated successfully."),
        @ApiResponse(responseCode = "400", description = "Invalid request body."),
        @ApiResponse(responseCode = "403", description = "Insufficient permissions."),
        @ApiResponse(responseCode = "500", description = "Internal server error.")
    })
    public ResponseEntity<String> getMachineIntinary(@RequestBody NearestMachineRequest body) {
        Point machineLocation = machineService.getMachineLocationById(body.getId());

        if (machineLocation == null)
            return ResponseEntity.badRequest().body("Erreur : aucune machine trouvée avec l'identifiant fourni.");

        String orsUrl = "https://api.openrouteservice.org/v2/directions/driving-car";
        String requestBody = String.format(
            "{\"coordinates\":[[%f,%f],[%f,%f]]}",
            body.getLongitude(), body.getLatitude(),
            machineLocation.getX(), machineLocation.getY()
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", SECRET);

        HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                orsUrl, HttpMethod.POST, entity, String.class
            );
            return response;
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body("Erreur lors de l'appel à OpenRouteService: " + e.getMessage());
        }
    }
}