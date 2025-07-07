package com.pharmaxcess_server.pharmaxcess_server.dto;

/**
 * Data Transfer Object (DTO) for representing machine information.
 */
public class MachineDTO {

    private Integer id;
    private String name;
    private String status;
    private double latitude;
    private double longitude;

    /**
     * Constructs a MachineDTO with the provided details.
     *
     * @param id the machine's ID
     * @param name the machine's name
     * @param status the machine's status (e.g., operational, out of service)
     * @param latitude the latitude of the machine's location
     * @param longitude the longitude of the machine's location
     */
    public MachineDTO(Integer id, String name, String status, double latitude, double longitude) {
        this.id = id;
        this.name = name;
        this.status = status;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    /**
     * Gets the machine's ID.
     *
     * @return the machine's ID
     */
    public Integer getId() {
        return id;
    }

    /**
     * Gets the machine's name.
     *
     * @return the machine's name
     */
    public String getName() {
        return name;
    }

    /**
     * Gets the machine's status.
     *
     * @return the machine's status
     */
    public String getStatus() {
        return status;
    }

    /**
     * Gets the latitude of the machine's location.
     *
     * @return the latitude of the machine's location
     */
    public double getLatitude() {
        return latitude;
    }

    /**
     * Gets the longitude of the machine's location.
     *
     * @return the longitude of the machine's location
     */
    public double getLongitude() {
        return longitude;
    }
}