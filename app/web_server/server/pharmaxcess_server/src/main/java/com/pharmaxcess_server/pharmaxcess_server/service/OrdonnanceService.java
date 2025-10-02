package com.pharmaxcess_server.pharmaxcess_server.service;

import com.pharmaxcess_server.pharmaxcess_server.dto.IDDto;
import com.pharmaxcess_server.pharmaxcess_server.dto.OrdonnanceCreationRequest;
import com.pharmaxcess_server.pharmaxcess_server.model.Ordonnance;
import com.pharmaxcess_server.pharmaxcess_server.repository.OrdonnanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

/**
 * Service class for handling ticket-related operations.
 * <p>
 * This service provides methods to interact with the {@link OrdonnanceRepository} for managing tickets
 * including retrieving, creating, and updating tickets.
 * </p>
 */
@Service
public class OrdonnanceService {

    @Autowired
    private OrdonnanceRepository ordonnanceRepository;

    /**
     * Retrieves a page of tickets for a specific user, within a specified range.
     *
     * @param userId the ID of the user whose tickets are being retrieved
     * @return a list of {@link Ordonnance} objects
     */
    public List<Ordonnance> getUserOrdonnance(int userId) {
        return ordonnanceRepository.findOrdonnancesByUserId(userId);
    }

    /**
     * Creates a new ordonnance based on the given request data.
     *
     * @param ordonnanceCreationRequest the data required to create a new ordonnance
     * @return the created {@link Ordonnance}
     */
    public int createOrdonnance(OrdonnanceCreationRequest ordonnanceCreationRequest) {
        return ordonnanceRepository.createOrdonnance(1, ordonnanceCreationRequest.getName(), ordonnanceCreationRequest.getDate(), ordonnanceCreationRequest.getMedications());
    }

    /**
     * Deletes an ordonnance based on the given request data.
     *
     * @param iddto the data required to delete an ordonnance
     * @return the created {@link Ordonnance}
     */
    public int deleteOrdonnance(IDDto iddto) {
        return ordonnanceRepository.deleteOrdonnanceById(iddto.getId());
    }
}