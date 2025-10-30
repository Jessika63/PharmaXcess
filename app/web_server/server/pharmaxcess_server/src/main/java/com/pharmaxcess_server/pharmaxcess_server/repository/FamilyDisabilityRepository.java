package com.pharmaxcess_server.pharmaxcess_server.repository;

import java.util.Optional;
import com.pharmaxcess_server.pharmaxcess_server.model.FamilyDisability;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Repository class for managing {@link FamilyDisability} entities.
 */
@Repository
public interface FamilyDisabilityRepository extends JpaRepository<FamilyDisability, Long> {

    /**
     * Retrieves a {@link FamilyDisability} by its id.
     *
     * @param id the id of the ordonnance to retrieve
     * @return an {@link Optional} containing the found {@link FamilyDisability}, or empty if not found
     * @throws IllegalArgumentException if id is {@code null}
     */
    @Query("SELECT o FROM FamilyDisability o WHERE o.id = :id")
    Optional<FamilyDisability> findFamilyDisabilityById(@Param("id") Long id);

    /**
     * Retrieves a {@link FamilyDisability} by its user id.
     *
     * @param user_id the id of the user id to retrieve
     * @return an {@link Optional} containing the found {@link FamilyDisability}, or empty if not found
     * @throws IllegalArgumentException if id is {@code null}
     */
    @Query("SELECT o FROM FamilyDisability o WHERE o.user_id = :user_id")
    List<FamilyDisability> findFamilyDisabilitysByUserId(@Param("user_id") int user_id);

    /**
     * Creates and persists a new {@link FamilyDisability}.
     * <p>
     * This method delegates to the {@link FamilyDisabilityRepository} to persist the ordonnance
     * in the underlying database, and returns the managed entity instance.
     * </p>
     *
     * @param user_id the {@link int} to create (must not be {@code null})
     * @param name the {@link String} to create (must not be {@code null})
     * @param familymember the {@link String} to create (must not be {@code null})
     * @param severity the {@link String} to create (must not be {@code null})
     * @param treatement the {@link String} to create (must not be {@code null})
     * @return the persisted {@link int} with any auto-generated fields (such as ID) populated
     * @throws IllegalArgumentException if the ordonnance is {@code null}
     */
    @Modifying
    @Transactional
    @Query(value = "INSERT INTO familyDisability (user_id, name, familymember, medications, examens) VALUES (:user_id, :name, :familymember, :medications, :treatement)", nativeQuery = true)
    int createFamilyDisability(@Param("user_id") int user_id,
                     @Param("name") String name,
                     @Param("familymember") String familymember,
                     @Param("severity") String severity,
                     @Param("treatement") String treatement);

    /**
     * Deletes an ordonnance from the database by its unique identifier.
     *
     * @param id the unique identifier of the ordonnance to be deleted
     * @return the number of diseases deleted (should be 1 if successful, 0 if no ordonnance found with the given id)
     */
    @Query("DELETE FROM FamilyDisability o WHERE o.id = :id")
    int deleteFamilyDisabilityById(@Param("id") int id);
}