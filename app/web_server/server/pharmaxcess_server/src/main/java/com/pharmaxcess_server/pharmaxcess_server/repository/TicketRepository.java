package com.pharmaxcess_server.pharmaxcess_server.repository;

import java.util.Optional;
import com.pharmaxcess_server.pharmaxcess_server.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository class for managing {@link Ticket} entities.
 */
@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    /**
     * Retrieves a {@link Ticket} by its id.
     *
     * @param id the id of the ticket to retrieve
     * @return an {@link Optional} containing the found {@link Ticket}, or empty if not found
     * @throws IllegalArgumentException if id is {@code null}
     */
    @Query("SELECT t FROM Ticket t WHERE t.id = :id")
    Optional<Ticket> findTicketById(@Param("id") Long id);

    /**
     * Creates and persists a new {@link Ticket}.
     * <p>
     * This method delegates to the {@link TicketRepository} to persist the ticket
     * in the underlying database, and returns the managed entity instance.
     * </p>
     *
     * @param ticket the {@link Ticket} to create (must not be {@code null})
     * @return the persisted {@link Ticket} with any auto-generated fields (such as ID) populated
     * @throws IllegalArgumentException if the ticket is {@code null}
     */
    @Query(value = "INSERT INTO tickets (title, status) VALUES (:title, :status)", nativeQuery = true)
    int createTicket(@Param("title") String title,
                     @Param("status") String status);

    /**
     * Updates the assigned user of a ticket.
     *
     * @param id         the ID of the ticket
     * @param assignedTo the ID of the user to assign the ticket to
     * @return an {@link Optional} containing the updated ticket if found, otherwise empty
     */
    @Query("UPDATE Ticket t SET t.assignedTo = :assignedTo WHERE t.id = :id")
    int updateTicketAssignedTo(@Param("id") Long id, @Param("assignedTo") Long assignedTo);

    /**
     * Updates the status of a ticket.
     *
     * @param id     the ID of the ticket
     * @param status the new status of the ticket
     * @return an {@link Optional} containing the updated ticket if found, otherwise empty
     */
    @Query("UPDATE Ticket t SET t.status = :status WHERE t.id = :id")
    int updateTicketStatus(@Param("id") Long id, @Param("status") String status);

    /**
     * Retrieves a paginated list of tickets for a given user, sorted by creation date in descending order.
     *
     * @param userId the ID of the user
     * @param x      the starting index (1-based)
     * @param y      the ending index (inclusive)
     * @return a list of {@link Ticket} between the given indices
     */
    @Query(
      value = "SELECT * FROM tickets " +
              "WHERE user_id = :userId " +
              "ORDER BY created_at DESC " +
              "LIMIT :limit OFFSET :offset",
      nativeQuery = true
    )
    List<Ticket> findTicketsByUserIdBetween(
            @Param("userId") Long userId,
            @Param("limit") int limit,
            @Param("offset") int offset
    );
}