package com.pharmaxcess_server.pharmaxcess_server.dto;

/**
 * Data Transfer Object (DTO) for representing pharmacy information.
 */
public class Pharmacy {
    private long id;
    private String name;
    private double lat;
    private double lon;

    /**
     * Sets the id of the pharmacy.
     *
     * @param id id of the pharmacy
     */
    public void setId(long id) { this.id = id; }

    /**
     * Gets the id of the pharmacy.
     *
     * @return the id of the pharmacy
     */
    public long getId() { return id; }

    /**
     * Sets the name of the pharmacy.
     *
     * @param name name of the pharmacy
     */
    public void setName(String name) { this.name = name; }

    /**
     * Gets the name of the pharmacy.
     *
     * @return the name of the pharmacy
     */
    public String getName() { return name; }

    /**
     * Sets the latitude of the pharmacy's location.
     *
     * @param lat latitude of the pharmacy's location
     */
    public void setLat(double lat) { this.lat = lat; }

    /**
     * Gets the latitude of the pharmacy's location.
     *
     * @return the latitude of the pharmacy's location
     */
    public double getLat() { return lat; }

    /**
     * Sets the longitude of the pharmacy's location.
     *
     * @param lon longitude of the pharmacy's location
     */
    public void setLon(double lon) { this.lon = lon; }

    /**
     * Gets the longitude of the pharmacy's location.
     *
     * @return the longitude of the pharmacy's location
     */
    public double getLong() { return lon; }
}
