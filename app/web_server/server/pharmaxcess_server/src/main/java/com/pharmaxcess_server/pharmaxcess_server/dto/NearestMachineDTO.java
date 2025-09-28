package com.pharmaxcess_server.pharmaxcess_server.dto;

/**
 * Data Transfer Object (DTO) for representing machine information.
 */
public interface NearestMachineDTO {

    /**
     * Gets the ID of the nearest machine request.
     *
     * @return the ID of the request
     */
    Integer getId();

    /**
     * Gets the name of the nearest machine request.
     *
     * @return the name of the request
     */
    String getName();

    /**
     * Gets the status of the nearest machine request.
     *
     * @return the status of the request
     */
    String getStatus();
}
