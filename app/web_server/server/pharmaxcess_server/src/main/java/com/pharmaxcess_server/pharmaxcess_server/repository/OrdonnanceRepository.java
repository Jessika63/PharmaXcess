package com.pharmaxcess_server.pharmaxcess_server.repository;

import java.util.Optional;
import com.pharmaxcess_server.pharmaxcess_server.model.Ordonnance;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository class for managing {@link Ordonnance} entities.
 */
@Repository
public interface OrdonnanceRepository extends JpaRepository<Ordonnance, Long> {

    /**
     * Retrieves a {@link Ordonnance} by its id.
     *
     * @param id the id of the ordonnance to retrieve
     * @return an {@link Optional} containing the found {@link Ordonnance}, or empty if not found
     * @throws IllegalArgumentException if id is {@code null}
     */
    @Query("SELECT o FROM Ordonnance o WHERE o.id = :id")
    Optional<Ordonnance> findOrdonnanceById(@Param("id") Long id);

    /**
     * Retrieves a {@link Ordonnance} by its user id.
     *
     * @param user_id the id of the user id to retrieve
     * @return an {@link Optional} containing the found {@link Ordonnance}, or empty if not found
     * @throws IllegalArgumentException if id is {@code null}
     */
    @Query("SELECT o FROM Ordonnance o WHERE o.user_id = :user_id")
    List<Ordonnance> findOrdonnancesByUserId(@Param("user_id") int user_id);

    /**
     * Creates and persists a new {@link Ordonnance}.
     * <p>
     * This method delegates to the {@link OrdonnanceRepository} to persist the ordonnance
     * in the underlying database, and returns the managed entity instance.
     * </p>
     *
     * @param user_id the {@link int} to create (must not be {@code null})
     * @param doctor_name the {@link String} to create (must not be {@code null})
     * @param created_at the {@link LocalDateTime} to create (must not be {@code null})
     * @param medications the {@link String} to create (must not be {@code null})
     * @return the persisted {@link int} with any auto-generated fields (such as ID) populated
     * @throws IllegalArgumentException if the ordonnance is {@code null}
     */
    @Modifying
    @Transactional
    @Query(value = "INSERT INTO ordonnances (user_id, doctor_name, created_at, medications) VALUES (:user_id, :doctor_name, :created_at, :medications)", nativeQuery = true)
    int createOrdonnance(@Param("user_id") int user_id,
                     @Param("doctor_name") String doctor_name,
                     @Param("created_at") LocalDateTime created_at,
                     @Param("medications") String medications);

    /**
     * Deletes an ordonnance from the database by its unique identifier.
     *
     * @param id the unique identifier of the ordonnance to be deleted
     * @return the number of ordonnances deleted (should be 1 if successful, 0 if no ordonnance found with the given id)
     */
    @Query("DELETE FROM Ordonnance o WHERE o.id = :id")
    int deleteOrdonnanceById(@Param("id") int id);
}