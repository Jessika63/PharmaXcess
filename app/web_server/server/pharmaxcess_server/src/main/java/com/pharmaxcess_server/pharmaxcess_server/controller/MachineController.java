package com.pharmaxcess_server.pharmaxcess_server.controller;

import com.pharmaxcess_server.pharmaxcess_server.dto.LocationRequest;
import com.pharmaxcess_server.pharmaxcess_server.dto.MachineDTO;
import com.pharmaxcess_server.pharmaxcess_server.dto.NearestMachineRequest;
import com.pharmaxcess_server.pharmaxcess_server.model.Machine;
import com.pharmaxcess_server.pharmaxcess_server.service.MachineService;
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

@RestController
@RequestMapping("/api/machines")
public class MachineController {

    private final MachineService machineService;
    private final GeometryFactory geometryFactory = new GeometryFactory();

    @Autowired
    public MachineController(MachineService machineService) {
        this.machineService = machineService;
    }

    @GetMapping
    @PreAuthorize("@roleHierarchyUtil.hasSufficientRole(authentication.authorities.iterator().next().authority, 'ROLE_USER')")
    public List<MachineDTO> getAllMachines() {
        return machineService.getAllMachines();
    }

    @GetMapping("/nearest")
    @PreAuthorize("@roleHierarchyUtil.hasSufficientRole(authentication.authorities.iterator().next().authority, 'ROLE_USER')")
    public List<Machine> getNearestMachines(@RequestBody LocationRequest body) {
        Point userLocation = geometryFactory.createPoint(new Coordinate(body.getLatitude(), body.getLongitude()));

        return machineService.getNearestMachines(userLocation);
    }

    @GetMapping("/itinary")
    @PreAuthorize("@roleHierarchyUtil.hasSufficientRole(authentication.authorities.iterator().next().authority, 'ROLE_USER')")
    public String getMachineIntinary(@RequestBody NearestMachineRequest body) {
        Point machineLocation = machineService.getMachineLocationById(body.getId());

        return String.format(
            "https://www.google.com/maps/dir/?api=1&origin=%f,%f&destination=%f,%f&travelmode=driving",
            body.getLatitude(), body.getLongitude(),
            machineLocation.getX(), machineLocation.getY()
        );
    }
}
