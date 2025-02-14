package com.pharmaxcess_server.pharmaxcess_server.repository;

import com.pharmaxcess_server.pharmaxcess_server.model.Machine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.locationtech.jts.geom.Point;

import java.util.List;

@Repository
public interface MachineRepository extends JpaRepository<Machine, Integer> {
    @Query(value = "SELECT * FROM machines m WHERE m.status = :status AND ST_DWithin(m.location, :location, :distance)", nativeQuery = true)
    List<Machine> findByStatusAndLocationNear(String status, Point location, double distance);

    @Query("SELECT m FROM Machine m WHERE m.id = :id")
    Machine getMachineById(@Param("id") Integer id);

    @Query("SELECT m.location FROM Machine m WHERE m.id = :id")
    Point getMachineLocationById(@Param("id") Integer id);
}
