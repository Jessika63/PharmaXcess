package com.pharmaxcess_server.pharmaxcess_server.dto;

import java.time.LocalDateTime;

/**
 * The OrdonnanceCreationRequest class represents a request to create an ordonnance.
 * It provides constructors to initialize data getter and setter methods to access.
 */
public class OrdonnanceCreationRequest {

    private String name;
    private int user_id;
    private LocalDateTime date;
    private String medications;


    /**
     * Default constructor for OrdonnanceCreationRequest.
     */
    public OrdonnanceCreationRequest() {
    }

    /**
     * Returns the name associated with this OrdonnanceCreationRequest.
     *
     * @return the name as a String
     */
    public String getName() {
        return name;
    }

    /**
     * Sets the name associated with this OrdonnanceCreationRequest.
     *
     * @param name as a String
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Returns the user_id associated with this OrdonnanceCreationRequest.
     *
     * @return the user_id as an int
     */
    public int getUser_id() {
        return user_id;
    }

    /**
     * Sets the user_id associated with this OrdonnanceCreationRequest.
     *
     * @param user_id as a Int
     */
    public void setUser_id(int user_id) {
        this.user_id = user_id;
    }

    /**
     * Returns the date associated with this OrdonnanceCreationRequest.
     *
     * @return the date as an LocalDateTime
     */
    public LocalDateTime getDate() {
        return date;
    }

    /**
     * Sets the date associated with this OrdonnanceCreationRequest.
     *
     * @param date as a LocalDateTime
     */
    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    /**
     * Returns the médications associated with this OrdonnanceCreationRequest.
     *
     * @return the médications as an String
     */
    public String getMedications() {
        return medications;
    }

    /**
     * Sets the medications associated with this OrdonnanceCreationRequest.
     *
     * @param medications as a String
     */
    public void setMedications(String medications) {
        this.medications = medications;
    }
}