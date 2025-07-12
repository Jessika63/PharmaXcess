package com.pharmaxcess_server.pharmaxcess_server.service;

import com.pharmaxcess_server.pharmaxcess_server.dto.MachineDTO;
import com.pharmaxcess_server.pharmaxcess_server.model.Machine;
import com.pharmaxcess_server.pharmaxcess_server.repository.MachineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.locationtech.jts.geom.Point;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service class for handling machine-related operations.
 * <p>
 * This service provides methods to interact with the {@link MachineRepository} for managing
 * machines, including retrieving all machines, finding nearby machines, and retrieving machine details.
 * </p>
 */
@Service
public class MachineService {

    private final MachineRepository machineRepository;

    /**
     * Constructor to initialize the {@link MachineService} with the specified {@link MachineRepository}.
     *
     * @param machineRepository the repository for accessing machine data
     */
    @Autowired
    public MachineService(MachineRepository machineRepository) {
        this.machineRepository = machineRepository;
    }

    /**
     * Retrieves a list of all machines with their basic details, including ID, name, status, and location.
     *
     * @return a list of {@link MachineDTO} objects containing basic machine information
     */
    public List<MachineDTO> getAllMachines() {
        return machineRepository.findAll().stream()
            .map(machine -> new MachineDTO(
                machine.getId(),
                machine.getName(),
                machine.getStatus(),
                machine.getLocation().getY(),
                machine.getLocation().getX()
            ))
            .collect(Collectors.toList());
    }

    /**
     * Retrieves a list of operational machines within a specified range of the user's location.
     *
     * @param userLocation the location of the user to search for nearby machines
     * @return a list of {@link Machine} objects that are operational and within range of the user's location
     */
    public List<Machine> getNearestMachines(Point userLocation) {
        return machineRepository.findByStatusAndLocationNear("operational", userLocation, 100000);
    }

    /**
     * Retrieves a specific machine by its ID.
     *
     * @param id the ID of the machine to retrieve
     * @return the {@link Machine} with the specified ID, or {@code null} if not found
     */
    public Machine getMachineById(Integer id) {
        return machineRepository.getMachineById(id);
    }

    /**
     * Retrieves the location of a specific machine by its ID.
     *
     * @param id the ID of the machine whose location is being retrieved
     * @return the {@link Point} representing the machine's location
     */
    public Point getMachineLocationById(Integer id) {
        return machineRepository.getMachineLocationById(id);
    }
}