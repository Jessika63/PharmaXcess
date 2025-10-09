package com.pharmaxcess_server.pharmaxcess_server.service;

import com.pharmaxcess_server.pharmaxcess_server.dto.IDDto;
import com.pharmaxcess_server.pharmaxcess_server.dto.DoctorCreationRequest;
import com.pharmaxcess_server.pharmaxcess_server.model.Doctor;
import com.pharmaxcess_server.pharmaxcess_server.repository.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

/**
 * Service class for handling doctor-related operations.
 * <p>
 * This service provides methods to interact with the {@link DoctorRepository} for managing doctors
 * including retrieving, creating, and updating doctors.
 * </p>
 */
@Service
public class DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;

    /**
     * Retrieves a page of doctors for a specific user, within a specified range.
     *
     * @return a list of {@link Doctor} objects
     */
    public List<Doctor> getDoctor() {
        return doctorRepository.findAllDoctors();
    }

    /**
     * Creates a new doctor based on the given request data.
     *
     * @param doctorCreationRequest the data required to create a new doctor
     * @return the created {@link Doctor}
     */
    public int createDoctor(DoctorCreationRequest req) {
        return doctorRepository.createDoctor(req.getName(), req.getSpeciality(), req.getPhoneNumber(), req.getEmail(), req.getAddress(), req.getHospital());
    }

    /**
     * Deletes an doctor based on the given request data.
     *
     * @param iddto the data required to delete an doctor
     * @return the created {@link Doctor}
     */
    public int deleteDoctor(IDDto iddto) {
        return doctorRepository.deleteDoctorById(iddto.getId());
    }
}