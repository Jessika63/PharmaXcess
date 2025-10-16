package com.pharmaxcess_server.pharmaxcess_server.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;

/**
 * Represents a support allergy in the system.
 */
@Entity
@Table(name = "allergies")
public class Allergy {

    /**
     * Unique identifier for the allergy.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    /**
     * Identifier of the user who created the allergy.
     */
    @Column(name = "user_id", nullable = false)
    private Integer user_id;

    /**
     * Allergy's name.
     */
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    /**
     * Allergy's severity.
     */
    @Column(name = "severity", nullable = false, length = 100)
    private String severity;

    /**
     * Allergy's medications.
     */
    @Column(name = "medications", nullable = false, length = 100)
    private String medications;

    /**
     * Allergy's symptoms.
     */
    @Column(name = "symptoms", nullable = false, length = 100)
    private String symptoms;

    /**
     * Allergy's description.
     */
    @Column(name = "description", nullable = false, length = 100)
    private String description;

    /**
     * Timestamp when the allergy was created.
     */
    @Column(name = "beginDate", nullable = false)
    private LocalDateTime beginDate;

    /**
     * Gets the unique identifier of the allergy.
     *
     * @return the allergy ID
     */
    public Integer getId() {
        return id;
    }

    /**
     * Sets the unique identifier of the allergy.
     *
     * @param id the allergy ID
     */
    public void setId(Integer id) {
        this.id = id;
    }

    /**
     * Gets the identifier of the user who created the allergy.
     *
     * @return the user identifier
     */
    public Integer getUserid() {
        return user_id;
    }

    /**
     * Sets the identifier of the user who created the allergy.
     *
     * @param user_id the user identifier to set
     */
    public void setUserid(Integer user_id) {
        this.user_id = user_id;
    }

    /**
     * Gets the allergy name.
     *
     * @return the allergy name
     */
    public String getName() {
        return name;
    }

    /**
     * Sets the allergy name.
     *
     * @param name the allergy name to set
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Gets the allergy severity.
     *
     * @return the allergy severity
     */
    public String getSeverity() {
        return severity;
    }

    /**
     * Sets the allergy severity.
     *
     * @param severity the allergy severity to set
     */
    public void setSeverity(String severity) {
        this.severity = severity;
    }

    /**
     * Gets the medications for the allergy.
     *
     * @return the medications
     */
    public String getMedication() {
        return medications;
    }

    /**
     * Sets the medications for the allergy.
     *
     * @param medications the medications to set
     */
    public void setMedication(String medications) {
        this.medications = medications;
    }

    /**
     * Gets the symptoms related to the allergy.
     *
     * @return the symptoms
     */
    public String getExamens() {
        return symptoms;
    }

    /**
     * Sets the symptoms related to the allergy.
     *
     * @param symptoms the symptoms to set
     */
    public void setExamens(String symptoms) {
        this.symptoms = symptoms;
    }

    /**
     * Gets the description related to the allergy.
     *
     * @return the description
     */
    public String getDescription() {
        return description;
    }

    /**
     * Sets the description related to the allergy.
     *
     * @param description the description to set
     */
    public void setDescription(String description) {
        this.description = description;
    }

    /**
     * Gets the timestamp when the allergy was created.
     *
     * @return the creation timestamp
     */
    public LocalDateTime getBeginDate() {
        return beginDate;
    }

    /**
     * Sets the timestamp when the allergy was created.
     *
     * @param beginDate the creation timestamp to set
     */
    public void setBeginDate(LocalDateTime beginDate) {
        this.beginDate = beginDate;
    }
}