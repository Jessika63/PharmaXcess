package com.pharmaxcess_server.pharmaxcess_server.service;

import com.pharmaxcess_server.pharmaxcess_server.dto.MachineDTO;
import com.pharmaxcess_server.pharmaxcess_server.model.Machine;
import com.pharmaxcess_server.pharmaxcess_server.repository.MachineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.locationtech.jts.geom.Point;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MachineService {

    private final MachineRepository machineRepository;

    @Autowired
    public MachineService(MachineRepository machineRepository) {
        this.machineRepository = machineRepository;
    }

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

    public List<Machine> getNearestMachines(Point userLocation) {
        return machineRepository.findByStatusAndLocationNear("operational", userLocation, 100000);
    }

    public Machine getMachineById(Integer id) {
        return machineRepository.getMachineById(id);
    }

    public Point getMachineLocationById(Integer id) {
        return machineRepository.getMachineLocationById(id);
    };
}
