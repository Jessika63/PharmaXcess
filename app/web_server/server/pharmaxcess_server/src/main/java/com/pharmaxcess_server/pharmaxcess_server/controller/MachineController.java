package com.pharmaxcess_server.pharmaxcess_server.controller;

import com.pharmaxcess_server.pharmaxcess_server.dto.MachineDTO;
import com.pharmaxcess_server.pharmaxcess_server.model.Machine;
import com.pharmaxcess_server.pharmaxcess_server.service.MachineService;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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
    public List<MachineDTO> getAllMachines() {
        return machineService.getAllMachines();
    }

    @GetMapping("/nearest")
    public List<Machine> getNearestMachines(@RequestParam double latitude, @RequestParam double longitude) {
        Point userLocation = geometryFactory.createPoint(new Coordinate(latitude, longitude));

        return machineService.getNearestMachines(userLocation);
    }

    @GetMapping("/itinary")
    public String getMachineIntinary(@RequestParam double latitude, @RequestParam double longitude, @RequestParam Integer id) {
        Point machineLocation = machineService.getMachineLocationById(id);

        return String.format(
            "https://www.google.com/maps/dir/?api=1&origin=%f,%f&destination=%f,%f&travelmode=driving",
            latitude, longitude,
            machineLocation.getX(), machineLocation.getY()
        );
    }
}
