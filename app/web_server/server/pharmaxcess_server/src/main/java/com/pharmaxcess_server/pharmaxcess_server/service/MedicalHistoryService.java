package com.pharmaxcess_server.pharmaxcess_server.service;

import com.pharmaxcess_server.pharmaxcess_server.dto.IDDto;
import com.pharmaxcess_server.pharmaxcess_server.dto.FamilyDisabilityCreationRequest;
import com.pharmaxcess_server.pharmaxcess_server.model.FamilyDisability;
import com.pharmaxcess_server.pharmaxcess_server.repository.FamilyDisabilityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

/**
 * Service class for handling ticket-related operations.
 * <p>
 * This service provides methods to interact with the {@link FamilyDisabilityRepository} for managing tickets
 * including retrieving, creating, and updating tickets.
 * </p>
 */
@Service
public class FamilyDisabilityService {

    @Autowired
    private FamilyDisabilityRepository FamilyDisabilityRepository;

    /**
     * Retrieves a page of tickets for a specific user, within a specified range.
     *
     * @param userId the ID of the user whose tickets are being retrieved
     * @return a list of {@link FamilyDisability} objects
     */
    public List<FamilyDisability> getUserFamilyDisability(int userId) {
        return FamilyDisabilityRepository.findFamilyDisabilitysByUserId(userId);
    }

    /**
     * Creates a new FamilyDisability based on the given request data.
     *
     * @param FamilyDisabilityCreationRequest the data required to create a new FamilyDisability
     * @return the created {@link FamilyDisability}
     */
    public int createFamilyDisability(FamilyDisabilityCreationRequest FamilyDisabilityCreationRequest) {
        return FamilyDisabilityRepository.createFamilyDisability(1, FamilyDisabilityCreationRequest.getName(), FamilyDisabilityCreationRequest.getFamilyMember(), FamilyDisabilityCreationRequest.getSeverity(), FamilyDisabilityCreationRequest.getTreatement());
    }

    /**
     * Deletes an FamilyDisability based on the given request data.
     *
     * @param iddto the data required to delete an FamilyDisability
     * @return the created {@link FamilyDisability}
     */
    public int deleteFamilyDisability(IDDto iddto) {
        return FamilyDisabilityRepository.deleteFamilyDisabilityById(iddto.getId());
    }
}