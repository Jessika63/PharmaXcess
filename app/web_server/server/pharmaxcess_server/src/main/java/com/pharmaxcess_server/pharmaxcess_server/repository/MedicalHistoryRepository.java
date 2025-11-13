package com.pharmaxcess_server.pharmaxcess_server.repository;

import com.pharmaxcess_server.pharmaxcess_server.model.MedicalHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for performing CRUD operations on {@link MedicalHistory} entities.
 *
 * <p>This interface extends {@link JpaRepository}, providing built-in methods such as
 * {@code findAll()}, {@code save()}, and {@code deleteById()}.
 * Additionally, it defines custom SQL queries for domain-specific actions.</p>
 *
 * <p>Annotated with {@link Repository} to indicate that this interface
 * is a Spring-managed data access component.</p>
 */
@Repository
public interface MedicalHistoryRepository extends JpaRepository<MedicalHistory, Integer> {

    /**
     * Retrieves a specific medical history record by its ID.
     *
     * @param id the unique identifier of the medical history record
     * @return an {@link Optional} containing the {@link MedicalHistory} if found, or empty if not found
     */
    @Query(value = "SELECT * FROM medicalhistory WHERE id = :id", nativeQuery = true)
    Optional<MedicalHistory> getMedicalHistoryById(@Param("id") int id);

    /**
     * Retrieves all medical history entries associated with a specific user.
     *
     * @param userId the ID of the user whose medical history records should be fetched
     * @return a list of {@link MedicalHistory} belonging to the specified user
     */
    @Query(value = "SELECT * FROM medicalhistory WHERE user_id = :userId", nativeQuery = true)
    List<MedicalHistory> findMedicalHistorysByUserId(@Param("userId") int userId);

    /**
     * Inserts a new medical history record into the database using a native SQL query.
     *
     * <p>This method is annotated with {@link Modifying} and {@link Transactional} to
     * indicate that it performs a write operation within a transaction context.</p>
     *
     * @param userId      the ID of the user associated with the medical history
     * @param name        the title or name of the medical history record
     * @param description a detailed description of the condition
     * @param beginDate   the date when the condition began
     * @param endDate     the date when the condition ended
     * @param department  the department handling the case
     * @param hospital    the hospital where the user was treated
     * @param doctor      the doctor responsible for the case
     * @param medications medications associated with the medical condition
     * @return the number of rows affected by the insert operation (should be 1 if successful)
     */
    @Modifying
    @Transactional
    @Query(value = "INSERT INTO medicalhistory (user_id, name, description, beginDate, endDate, department, hospital, doctor, medications) " +
                   "VALUES (:userId, :name, :description, :beginDate, :endDate, :department, :hospital, :doctor, :medications)", nativeQuery = true)
    int createMedicalHistory(
            @Param("userId") int userId,
            @Param("name") String name,
            @Param("description") String description,
            @Param("beginDate") LocalDateTime beginDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("department") String department,
            @Param("hospital") String hospital,
            @Param("doctor") String doctor,
            @Param("medications") String medications
    );

    /**
     * Deletes a medical history record from the database by its ID.
     *
     * @param id the unique identifier of the medical history record to delete
     * @return the number of rows affected by the delete operation (should be 1 if successful)
     */
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM medicalhistory WHERE id = :id", nativeQuery = true)
    int deleteMedicalHistoryById(@Param("id") int id);
}
