package com.pharmaxcess_server.pharmaxcess_server.repository;

import java.util.Optional;
import com.pharmaxcess_server.pharmaxcess_server.model.Disease;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository class for managing {@link Disease} entities.
 */
@Repository
public interface DiseaseRepository extends JpaRepository<Disease, Long> {

    /**
     * Retrieves a {@link Disease} by its id.
     *
     * @param id the id of the ordonnance to retrieve
     * @return an {@link Optional} containing the found {@link Disease}, or empty if not found
     * @throws IllegalArgumentException if id is {@code null}
     */
    @Query("SELECT o FROM Disease o WHERE o.id = :id")
    Optional<Disease> findDiseaseById(@Param("id") Long id);

    /**
     * Retrieves a {@link Disease} by its user id.
     *
     * @param user_id the id of the user id to retrieve
     * @return an {@link Optional} containing the found {@link Disease}, or empty if not found
     * @throws IllegalArgumentException if id is {@code null}
     */
    @Query("SELECT o FROM Disease o WHERE o.user_id = :user_id")
    List<Disease> findDiseasesByUserId(@Param("user_id") int user_id);

    /**
     * Creates and persists a new {@link Disease}.
     * <p>
     * This method delegates to the {@link DiseaseRepository} to persist the ordonnance
     * in the underlying database, and returns the managed entity instance.
     * </p>
     *
     * @param user_id the {@link int} to create (must not be {@code null})
     * @param name the {@link String} to create (must not be {@code null})
     * @param description the {@link String} to create (must not be {@code null})
     * @param created_at the {@link LocalDateTime} to create (must not be {@code null})
     * @param medications the {@link String} to create (must not be {@code null})
     * @param examens the {@link String} to create (must not be {@code null})
     * @return the persisted {@link int} with any auto-generated fields (such as ID) populated
     * @throws IllegalArgumentException if the ordonnance is {@code null}
     */
    @Modifying
    @Transactional
    @Query(value = "INSERT INTO diseases (user_id, name, description, beginDate, medications, examens) VALUES (:user_id, :name, :description, :beginDate, :medications, :examens)", nativeQuery = true)
    int createDisease(@Param("user_id") int user_id,
                     @Param("name") String name,
                     @Param("description") String description,
                     @Param("beginDate") LocalDateTime beginDate,
                     @Param("medications") String medications,
                     @Param("examens") String examens);

    /**
     * Deletes an ordonnance from the database by its unique identifier.
     *
     * @param id the unique identifier of the ordonnance to be deleted
     * @return the number of diseases deleted (should be 1 if successful, 0 if no ordonnance found with the given id)
     */
    @Query("DELETE FROM Disease o WHERE o.id = :id")
    int deleteDiseaseById(@Param("id") int id);
}