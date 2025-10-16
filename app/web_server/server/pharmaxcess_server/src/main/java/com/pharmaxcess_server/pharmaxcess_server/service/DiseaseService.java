package com.pharmaxcess_server.pharmaxcess_server.service;

import com.pharmaxcess_server.pharmaxcess_server.dto.IDDto;
import com.pharmaxcess_server.pharmaxcess_server.dto.DiseaseCreationRequest;
import com.pharmaxcess_server.pharmaxcess_server.model.Disease;
import com.pharmaxcess_server.pharmaxcess_server.repository.DiseaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

/**
 * Service class for handling ticket-related operations.
 * <p>
 * This service provides methods to interact with the {@link DiseaseRepository} for managing tickets
 * including retrieving, creating, and updating tickets.
 * </p>
 */
@Service
public class DiseaseService {

    @Autowired
    private DiseaseRepository diseaseRepository;

    /**
     * Retrieves a page of tickets for a specific user, within a specified range.
     *
     * @param userId the ID of the user whose tickets are being retrieved
     * @return a list of {@link Disease} objects
     */
    public List<Disease> getUserDisease(int userId) {
        return diseaseRepository.findDiseasesByUserId(userId);
    }

    /**
     * Creates a new disease based on the given request data.
     *
     * @param diseaseCreationRequest the data required to create a new disease
     * @return the created {@link Disease}
     */
    public int createDisease(DiseaseCreationRequest diseaseCreationRequest) {
        return diseaseRepository.createDisease(1, diseaseCreationRequest.getName(), diseaseCreationRequest.getDate(), diseaseCreationRequest.getMedications());
    }

    /**
     * Deletes an disease based on the given request data.
     *
     * @param iddto the data required to delete an disease
     * @return the created {@link Disease}
     */
    public int deleteDisease(IDDto iddto) {
        return diseaseRepository.deleteDiseaseById(iddto.getId());
    }
}