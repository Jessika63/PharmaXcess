package com.pharmaxcess_server.pharmaxcess_server;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import com.pharmaxcess_server.pharmaxcess_server.model.Doctor;
import com.pharmaxcess_server.pharmaxcess_server.repository.DoctorRepository;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
public class DoctorRepositoryTest {

    @Autowired
    private DoctorRepository doctorRepository;

    @Test
    void testCreateDoctor() {
        Doctor doctor = new Doctor();
        doctor.setDoctor("Dr. Smith");
        doctor.setSpeciality("Cardiology");
        doctor.setPhoneNumber("1234567890");
        doctor.setEmail("dr.smith@example.com");
        doctor.setAddress("123 Main Street");
        doctor.setHospital("Saint-Luc");

        doctorRepository.save(doctor);

        Optional<Doctor> found = doctorRepository.findDoctorById(doctor.getId());
        assertTrue(found.isPresent());
        assertEquals("Dr. Smith", found.get().getDoctor());
    }
}
