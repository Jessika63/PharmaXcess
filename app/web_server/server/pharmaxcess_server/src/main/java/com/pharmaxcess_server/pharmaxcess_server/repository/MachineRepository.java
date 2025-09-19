package com.pharmaxcess_server.pharmaxcess_server.repository;

import com.pharmaxcess_server.pharmaxcess_server.model.Machine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.locationtech.jts.geom.Point;

import java.util.List;

/**
 * Repository interface for managing {@link Machine} entities.
 */
@Repository
public interface MachineRepository extends JpaRepository<Machine, Integer> {

    /**
     * Finds machines by status and within a specified distance from a given location.
     *
     * @param status   the operational status of the machine
     * @param location the reference location as a {@link Point}
     * @param distance the maximum distance (in meters) from the location
     * @return a list of machines matching the criteria
     */
    @Query(value = "SELECT * FROM machines m WHERE m.status = :status AND ST_DWithin(m.location, :location, :distance)", 
           nativeQuery = true)
    List<Machine> findByStatusAndLocationNear(@Param("status") String status,
                                              @Param("location") Point location,
                                              @Param("distance") double distance);

    /**
     * Retrieves a machine by its unique identifier.
     *
     * @param id the machine ID
     * @return the corresponding {@link Machine}, or null if not found
     */
    @Query("SELECT m FROM Machine m WHERE m.id = :id")
    Machine getMachineById(@Param("id") Integer id);

    /**
     * Retrieves the geographical location of a machine by its ID.
     *
     * @param id the machine ID
     * @return the location as a {@link Point}, or null if not found
     */
    @Query("SELECT m.location FROM Machine m WHERE m.id = :id")
    Point getMachineLocationById(@Param("id") Integer id);
}