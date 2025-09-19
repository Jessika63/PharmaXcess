package com.pharmaxcess_server.pharmaxcess_server.dto;

/**
 * Represents a nearest machine request to get machines around user
 */
public class NearestMachineRequest {

    private Integer id;
    private double latitude;
    private double longitude;

    /**
     * Gets the ID of the nearest machine request.
     *
     * @return the ID of the request
     */
    public Integer getId() {
        return id;
    }

    /**
     * Sets the ID of the nearest machine request.
     *
     * @param id the ID to set
     */
    public void setId(Integer id) {
        this.id = id;
    }

    /**
     * Gets the latitude of the location for the nearest machine request.
     *
     * @return the latitude of the location
     */
    public double getLatitude() {
        return latitude;
    }

    /**
     * Sets the latitude of the location for the nearest machine request.
     *
     * @param latitude the latitude to set
     */
    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }

    /**
     * Gets the longitude of the location for the nearest machine request.
     *
     * @return the longitude of the location
     */
    public double getLongitude() {
        return longitude;
    }

    /**
     * Sets the longitude of the location for the nearest machine request.
     *
     * @param longitude the longitude to set
     */
    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }
}