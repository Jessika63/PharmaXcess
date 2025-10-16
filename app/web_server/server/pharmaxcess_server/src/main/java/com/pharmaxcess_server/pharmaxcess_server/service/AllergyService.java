package com.pharmaxcess_server.pharmaxcess_server.service;

import com.pharmaxcess_server.pharmaxcess_server.dto.IDDto;
import com.pharmaxcess_server.pharmaxcess_server.dto.AllergyCreationRequest;
import com.pharmaxcess_server.pharmaxcess_server.model.Allergy;
import com.pharmaxcess_server.pharmaxcess_server.repository.AllergyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

/**
 * Service class for handling allergy-related operations.
 * <p>
 * This service provides methods to interact with the {@link AllergyRepository} for managing allergies
 * including retrieving, creating, and updating allergies.
 * </p>
 */
@Service
public class AllergyService {

    @Autowired
    private AllergyRepository allergyRepository;

    /**
     * Retrieves a page of allergies for a specific user, within a specified range.
     *
     * @param userId the ID of the user whose allergies are being retrieved
     * @return a list of {@link Allergy} objects
     */
    public List<Allergy> getUserAllergy(int userId) {
        return allergyRepository.findAllergysByUserId(userId);
    }

    /**
     * Creates a new allergy based on the given request data.
     *
     * @param allergyCreationRequest the data required to create a new allergy
     * @return the created {@link Allergy}
     */
    public int createAllergy(AllergyCreationRequest allergyCreationRequest) {
        return allergyRepository.createAllergy(1, allergyCreationRequest.getName(), allergyCreationRequest.getSeverity(), allergyCreationRequest.getDate(), allergyCreationRequest.getMedications(), allergyCreationRequest.getComments(), allergyCreationRequest.getSymptoms());
    }

    /**
     * Deletes an allergy based on the given request data.
     *
     * @param iddto the data required to delete an allergy
     * @return the created {@link Allergy}
     */
    public int deleteAllergy(IDDto iddto) {
        return allergyRepository.deleteAllergyById(iddto.getId());
    }
}