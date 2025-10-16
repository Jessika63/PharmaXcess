package com.pharmaxcess_server.pharmaxcess_server.repository;

import java.util.Optional;
import com.pharmaxcess_server.pharmaxcess_server.model.Allergy;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository class for managing {@link Allergy} entities.
 */
@Repository
public interface AllergyRepository extends JpaRepository<Allergy, Long> {

    /**
     * Retrieves a {@link Allergy} by its id.
     *
     * @param id the id of the ordonnance to retrieve
     * @return an {@link Optional} containing the found {@link Allergy}, or empty if not found
     * @throws IllegalArgumentException if id is {@code null}
     */
    @Query("SELECT o FROM Allergy o WHERE o.id = :id")
    Optional<Allergy> findAllergyById(@Param("id") Long id);

    /**
     * Retrieves a {@link Allergy} by its user id.
     *
     * @param user_id the id of the user id to retrieve
     * @return an {@link Optional} containing the found {@link Allergy}, or empty if not found
     * @throws IllegalArgumentException if id is {@code null}
     */
    @Query("SELECT o FROM Allergy o WHERE o.user_id = :user_id")
    List<Allergy> findAllergysByUserId(@Param("user_id") int user_id);

    /**
     * Creates and persists a new {@link Allergy}.
     * <p>
     * This method delegates to the {@link AllergyRepository} to persist the ordonnance
     * in the underlying database, and returns the managed entity instance.
     * </p>
     *
     * @param user_id the {@link int} to create (must not be {@code null})
     * @param name the {@link String} to create (must not be {@code null})
     * @param severity the {@link String} to create (must not be {@code null})
     * @param beginDate the {@link LocalDateTime} to create (must not be {@code null})
     * @param medications the {@link String} to create (must not be {@code null})
     * @param comments the {@link String} to create (must not be {@code null})
     * @param symptoms the {@link String} to create (must not be {@code null})
     * @return the persisted {@link int} with any auto-generated fields (such as ID) populated
     * @throws IllegalArgumentException if the ordonnance is {@code null}
     */
    @Modifying
    @Transactional
    @Query(value = "INSERT INTO allergies (user_id, name, severity, beginDate, medications, comments, symptoms) VALUES (:user_id, :name, :severity, :beginDate, :medications, :comments, :symptoms)", nativeQuery = true)
    int createAllergy(@Param("user_id") int user_id,
                     @Param("name") String name,
                     @Param("severity") String severity,
                     @Param("beginDate") LocalDateTime beginDate,
                     @Param("medications") String medications,
                     @Param("comments") String comments,
                     @Param("symptoms") String symptoms);

    /**
     * Deletes an ordonnance from the database by its unique identifier.
     *
     * @param id the unique identifier of the ordonnance to be deleted
     * @return the number of allergys deleted (should be 1 if successful, 0 if no ordonnance found with the given id)
     */
    @Query("DELETE FROM Allergy o WHERE o.id = :id")
    int deleteAllergyById(@Param("id") int id);
}