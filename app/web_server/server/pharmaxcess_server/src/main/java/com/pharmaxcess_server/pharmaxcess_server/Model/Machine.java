package com.pharmaxcess_server.pharmaxcess_server.model;

import org.locationtech.jts.geom.Point;
import jakarta.persistence.*;

/**
 * Represents a vending machine in the system.
 */
@Entity
@Table(name = "machines")
public class Machine {

    /**
     * Unique identifier for the machine.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    /**
     * Name of the machine.
     */
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    /**
     * Geographical location of the machine.
     */
    @Column(name = "location", nullable = false)
    private Point location;

    /**
     * Current operational status of the machine.
     * Defaults to "operational".
     */
    @Column(name = "status", nullable = false, length = 20)
    private String status = "operational";

    /**
     * Gets the unique identifier of the machine.
     *
     * @return the machine ID
     */
    public Integer getId() {
        return id;
    }

    /**
     * Sets the unique identifier of the machine.
     *
     * @param id the machine ID
     */
    public void setId(Integer id) {
        this.id = id;
    }

    /**
     * Gets the name of the machine.
     *
     * @return the machine name
     */
    public String getName() {
        return name;
    }

    /**
     * Sets the name of the machine.
     *
     * @param name the machine name
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Gets the geographical location of the machine.
     *
     * @return the machine location as a Point
     */
    public Point getLocation() {
        return location;
    }

    /**
     * Sets the geographical location of the machine.
     *
     * @param location the machine location as a Point
     */
    public void setLocation(Point location) {
        this.location = location;
    }

    /**
     * Gets the current operational status of the machine.
     *
     * @return the machine status
     */
    public String getStatus() {
        return status;
    }

    /**
     * Sets the current operational status of the machine.
     *
     * @param status the machine status
     */
    public void setStatus(String status) {
        this.status = status;
    }
}