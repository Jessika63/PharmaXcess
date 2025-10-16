package com.pharmaxcess_server.pharmaxcess_server.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;

/**
 * Represents a support disease in the system.
 */
@Entity
@Table(name = "diseases")
public class Disease {

    /**
     * Unique identifier for the ticket.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    /**
     * Identifier of the user who created the disease.
     */
    @Column(name = "user_id", nullable = false)
    private Integer user_id;

    /**
     * Disease's name.
     */
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    /**
     * Disease's description.
     */
    @Column(name = "description", nullable = false, length = 100)
    private String description;

    /**
     * Disease's medication.
     */
    @Column(name = "medication", nullable = false, length = 100)
    private String medication;

    /**
     * Disease's examens.
     */
    @Column(name = "examens", nullable = false, length = 100)
    private String examens;

    /**
     * Timestamp when the disease was created.
     */
    @Column(name = "beginDate", nullable = false)
    private LocalDateTime beginDate;

    /**
     * Gets the unique identifier of the disease.
     *
     * @return the disease ID
     */
    public Integer getId() {
        return id;
    }

    /**
     * Sets the unique identifier of the disease.
     *
     * @param id the disease ID
     */
    public void setId(Integer id) {
        this.id = id;
    }

    /**
     * Gets the identifier of the user who created the disease.
     *
     * @return the user identifier
     */
    public Integer getUserid() {
        return user_id;
    }

    /**
     * Sets the identifier of the user who created the disease.
     *
     * @param user_id the user identifier to set
     */
    public void setUserid(Integer user_id) {
        this.user_id = user_id;
    }

    /**
     * Gets the disease name.
     *
     * @return the disease name
     */
    public String getName() {
        return name;
    }

    /**
     * Sets the disease name.
     *
     * @param name the disease name to set
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Gets the disease description.
     *
     * @return the disease description
     */
    public String getDescription() {
        return description;
    }

    /**
     * Sets the disease description.
     *
     * @param description the disease description to set
     */
    public void setDescription(String description) {
        this.description = description;
    }

    /**
     * Gets the medication for the disease.
     *
     * @return the medication
     */
    public String getMedication() {
        return medication;
    }

    /**
     * Sets the medication for the disease.
     *
     * @param medication the medication to set
     */
    public void setMedication(String medication) {
        this.medication = medication;
    }

    /**
     * Gets the examens related to the disease.
     *
     * @return the examens
     */
    public String getExamens() {
        return examens;
    }

    /**
     * Sets the examens related to the disease.
     *
     * @param examens the examens to set
     */
    public void setExamens(String examens) {
        this.examens = examens;
    }

    /**
     * Gets the timestamp when the disease was created.
     *
     * @return the creation timestamp
     */
    public LocalDateTime getBeginDate() {
        return beginDate;
    }

    /**
     * Sets the timestamp when the disease was created.
     *
     * @param beginDate the creation timestamp to set
     */
    public void setBeginDate(LocalDateTime beginDate) {
        this.beginDate = beginDate;
    }
}