package com.pharmaxcess_server.pharmaxcess_server.dto;

import java.time.LocalDateTime;

/**
 * The AllergyCreationRequest class represents a request to create an ordonnance.
 * It provides constructors to initialize data getter and setter methods to access.
 */
public class AllergyCreationRequest {

    private String name;
    private int user_id;
    private String severity;
    private String symptoms;
    private String medications;
    private String comments;
    private LocalDateTime date;

    /**
     * Default constructor for AllergyCreationRequest.
     */
    public AllergyCreationRequest() {
    }

    /**
     * Returns the name associated with this AllergyCreationRequest.
     *
     * @return the name as a String
     */
    public String getName() {
        return name;
    }

    /**
     * Sets the name associated with this AllergyCreationRequest.
     *
     * @param name as a String
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Returns the user_id associated with this AllergyCreationRequest.
     *
     * @return the user_id as an int
     */
    public int getUser_id() {
        return user_id;
    }

    /**
     * Sets the user_id associated with this AllergyCreationRequest.
     *
     * @param user_id as a Int
     */
    public void setUser_id(int user_id) {
        this.user_id = user_id;
    }

    /**
     * Returns the date associated with this AllergyCreationRequest.
     *
     * @return the date as an LocalDateTime
     */
    public LocalDateTime getDate() {
        return date;
    }

    /**
     * Sets the date associated with this AllergyCreationRequest.
     *
     * @param date as a LocalDateTime
     */
    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    /**
     * Returns the severity associated with this AllergyCreationRequest.
     *
     * @return the severity as a String
     */
    public String getSeverity() {
        return severity;
    }

    /**
     * Sets the severity associated with this AllergyCreationRequest.
     *
     * @param severity the severity as a String
     */
    public void setSeverity(String severity) {
        this.severity = severity;
    }

    /**
     * Returns the symptoms associated with this AllergyCreationRequest.
     *
     * @return the symptoms as a String
     */
    public String getSymptoms() {
        return symptoms;
    }

    /**
     * Sets the symptoms associated with this AllergyCreationRequest.
     *
     * @param symptoms the symptoms as a String
     */
    public void setSymptoms(String symptoms) {
        this.symptoms = symptoms;
    }

    /**
     * Returns the medications associated with this AllergyCreationRequest.
     *
     * @return the medications as a String
     */
    public String getMedications() {
        return medications;
    }

    /**
     * Sets the medications associated with this AllergyCreationRequest.
     *
     * @param medications the medications as a String
     */
    public void setMedications(String medications) {
        this.medications = medications;
    }

    /**
     * Returns the comments associated with this AllergyCreationRequest.
     *
     * @return the comments as a String
     */
    public String getComments() {
        return comments;
    }

    /**
     * Sets the comments associated with this AllergyCreationRequest.
     *
     * @param comments the comments as a String
     */
    public void setComments(String comments) {
        this.comments = comments;
    }
}