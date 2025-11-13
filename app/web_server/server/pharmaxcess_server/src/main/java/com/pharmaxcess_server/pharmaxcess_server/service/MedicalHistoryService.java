package com.pharmaxcess_server.pharmaxcess_server.service;

import com.pharmaxcess_server.pharmaxcess_server.dto.IDDto;
import com.pharmaxcess_server.pharmaxcess_server.dto.MedicalHistoryCreationRequest;
import com.pharmaxcess_server.pharmaxcess_server.model.MedicalHistory;
import com.pharmaxcess_server.pharmaxcess_server.repository.MedicalHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

/**
 * Service class for handling ticket-related operations.
 * <p>
 * This service provides methods to interact with the {@link MedicalHistoryRepository} for managing tickets
 * including retrieving, creating, and updating tickets.
 * </p>
 */
@Service
public class MedicalHistoryService {

    @Autowired
    private MedicalHistoryRepository MedicalHistoryRepository;

    /**
     * Retrieves a page of tickets for a specific user, within a specified range.
     *
     * @param userId the ID of the user whose tickets are being retrieved
     * @return a list of {@link MedicalHistory} objects
     */
    public List<MedicalHistory> getUserMedicalHistory(int userId) {
        return MedicalHistoryRepository.findMedicalHistorysByUserId(userId);
    }

    /**
     * Creates a new MedicalHistory based on the given request data.
     *
     * @param MedicalHistoryCreationRequest the data required to create a new MedicalHistory
     * @return the created {@link MedicalHistory}
     */
    public int createMedicalHistory(MedicalHistoryCreationRequest MedicalHistoryCreationRequest) {
        return MedicalHistoryRepository.createMedicalHistory(1, MedicalHistoryCreationRequest.getName(), MedicalHistoryCreationRequest.getDescription(), MedicalHistoryCreationRequest.getBeginDate(), MedicalHistoryCreationRequest.getEndDate(), MedicalHistoryCreationRequest.getDepartment(), MedicalHistoryCreationRequest.getHospital(), MedicalHistoryCreationRequest.getDoctor(), MedicalHistoryCreationRequest.getMedications());
    }

    /**
     * Deletes an MedicalHistory based on the given request data.
     *
     * @param iddto the data required to delete an MedicalHistory
     * @return the created {@link MedicalHistory}
     */
    public int deleteMedicalHistory(IDDto iddto) {
        return MedicalHistoryRepository.deleteMedicalHistoryById(iddto.getId());
    }
}