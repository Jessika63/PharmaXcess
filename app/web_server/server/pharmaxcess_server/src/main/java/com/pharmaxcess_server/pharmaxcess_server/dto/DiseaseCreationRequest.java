package com.pharmaxcess_server.pharmaxcess_server.dto;

import java.time.LocalDateTime;

/**
 * The DiseaseCreationRequest class represents a request to create an ordonnance.
 * It provides constructors to initialize data getter and setter methods to access.
 */
public class DiseaseCreationRequest {

    private String name;
    private int user_id;
    private String description;
    private String medication;
    private String examens;
    private LocalDateTime date;

    /**
     * Default constructor for DiseaseCreationRequest.
     */
    public DiseaseCreationRequest() {
    }

    /**
     * Returns the name associated with this DiseaseCreationRequest.
     *
     * @return the name as a String
     */
    public String getName() {
        return name;
    }

    /**
     * Sets the name associated with this DiseaseCreationRequest.
     *
     * @param name as a String
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Returns the user_id associated with this DiseaseCreationRequest.
     *
     * @return the user_id as an int
     */
    public int getUser_id() {
        return user_id;
    }

    /**
     * Sets the user_id associated with this DiseaseCreationRequest.
     *
     * @param user_id as a Int
     */
    public void setUser_id(int user_id) {
        this.user_id = user_id;
    }

    /**
     * Returns the date associated with this DiseaseCreationRequest.
     *
     * @return the date as an LocalDateTime
     */
    public LocalDateTime getDate() {
        return date;
    }

    /**
     * Sets the date associated with this DiseaseCreationRequest.
     *
     * @param date as a LocalDateTime
     */
    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    /**
     * Returns the description associated with this DiseaseCreationRequest.
     *
     * @return the description as a String
     */
    public String getDescription() {
        return description;
    }

    /**
     * Sets the description associated with this DiseaseCreationRequest.
     *
     * @param description the description as a String
     */
    public void setDescription(String description) {
        this.description = description;
    }

    /**
     * Returns the medication associated with this DiseaseCreationRequest.
     *
     * @return the medication as a String
     */
    public String getMedication() {
        return medication;
    }

    /**
     * Sets the medication associated with this DiseaseCreationRequest.
     *
     * @param medication the medication as a String
     */
    public void setMedication(String medication) {
        this.medication = medication;
    }

    /**
     * Returns the examens associated with this DiseaseCreationRequest.
     *
     * @return the examens as a String
     */
    public String getExamens() {
        return examens;
    }

    /**
     * Sets the examens associated with this DiseaseCreationRequest.
     *
     * @param examens the examens as a String
     */
    public void setExamens(String examens) {
        this.examens = examens;
    }
}