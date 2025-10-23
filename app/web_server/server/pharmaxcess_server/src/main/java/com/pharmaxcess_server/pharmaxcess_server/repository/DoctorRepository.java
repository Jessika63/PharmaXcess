package com.pharmaxcess_server.pharmaxcess_server.repository;

import java.util.Optional;
import com.pharmaxcess_server.pharmaxcess_server.model.Doctor;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Repository class for managing {@link Doctor} entities.
 */
@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    /**
     * Retrieves a {@link Doctor} by its id.
     *
     * @param id the id of the doctor to retrieve
     * @return an {@link Optional} containing the found {@link Doctor}, or empty if not found
     * @throws IllegalArgumentException if id is {@code null}
     */
    @Query("SELECT o FROM Doctor o WHERE o.id = :id")
    Optional<Doctor> findDoctorById(@Param("id") Integer id);

    /**
     * Retrieves all doctors.
     *
     * @return a list of all {@link Doctor} entities
     */
    @Query("SELECT d FROM Doctor d")
    List<Doctor> findAllDoctors();

    /**
     * Retrieves a {@link Doctor} by its user id.
     *
     * @param id the id of the doctor
     * @return an {@link Optional} containing the found {@link Doctor}, or empty if not found
     * @throws IllegalArgumentException if id is {@code null}
     */
    @Query("SELECT o FROM Doctor o WHERE o.id = :id")
    List<Doctor> findDoctorsById(@Param("id") int id);

    /**
     * Creates and persists a new {@link Doctor}.
     * <p>
     * This method delegates to the {@link DoctorRepository} to persist the doctor
     * in the underlying database, and returns the managed entity instance.
     * </p>
     *
     * @param name the {@link String} to create (must not be {@code null})
     * @param speciality the {@link String} to create (must not be {@code null})
     * @param phoneNumber the {@link String} to create (must not be {@code null})
     * @param email the {@link String} to create (must not be {@code null})
     * @param address the {@link String} to create (must not be {@code null})
     * @param hospital the {@link String} to create (must not be {@code null})
     * @return the persisted {@link int} with any auto-generated fields (such as ID) populated
     * @throws IllegalArgumentException if the doctor is {@code null}
     */
    @Modifying
    @Transactional
    @Query(value = "INSERT INTO doctors (name, speciality, phonenumber, email, address, hospital) VALUES (:name, :speciality, :phonenumber, :email, :address, :hospital)", nativeQuery = true)
    int createDoctor(@Param("name") String name,
                     @Param("speciality") String speciality,
                     @Param("phonenumber") String phoneNumber,
                     @Param("email") String email,
                     @Param("address") String address,
                     @Param("hospital") String hospital);

    /**
     * Deletes an doctor from the database by its unique identifier.
     *
     * @param id the unique identifier of the doctor to be deleted
     * @return the number of doctors deleted (should be 1 if successful, 0 if no doctor found with the given id)
     */
    @Query("DELETE FROM Doctor o WHERE o.id = :id")
    int deleteDoctorById(@Param("id") int id);
}