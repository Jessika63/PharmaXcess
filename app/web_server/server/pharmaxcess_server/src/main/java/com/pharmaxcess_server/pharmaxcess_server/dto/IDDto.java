package com.pharmaxcess_server.pharmaxcess_server.dto;

/**
 * Data Transfer Object (DTO) representing an identifier.
 * <p>
 * This class encapsulates an integer ID value, providing
 * getter and setter methods for accessing and modifying the ID.
 * </p>
 */
public class IDDto {
    private int id;

    /**
     * Sets the id.
     *
     * @param id the id to get
     */
    public void setId(int id) {
        this.id = id;
    }

    /**
     * Gets the id.
     *
     * @return the id
     */
    public int getId() {
        return id;
    }
}
