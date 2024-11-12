package com.pharmaxcess_server.pharmaxcess_server.repository;

import com.pharmaxcess_server.pharmaxcess_server.model.Machine;
import org.locationtech.jts.geom.Point;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MachineRepository extends JpaRepository<Machine, Integer> {
@Query(value = "SELECT * FROM machines m WHERE m.status = :status AND ST_DWithin(m.location, ST_SetSRID(ST_GeomFromText('POINT(' || :longitude || ' ' || :latitude || ')'), 4326), :distance)", nativeQuery = true)
List<Machine> findByStatusAndLocationNear(String status, double latitude, double longitude, double distance);

}
