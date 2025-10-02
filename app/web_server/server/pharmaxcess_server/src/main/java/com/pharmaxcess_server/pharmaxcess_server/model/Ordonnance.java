package com.pharmaxcess_server.pharmaxcess_server.model;

import java.time.LocalDateTime;
import jakarta.persistence.*;

/**
 * Represents a support ordonnance in the system.
 */
@Entity
@Table(name = "ordonnances")
public class Ordonnance {

    /**
     * Unique identifier for the ticket.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    /**
     * Doctor's name.
     */
    @Column(name = "doctor_name", nullable = false, length = 100)
    private String doctor_name;

    /**
     * Identifier of the user who created the ticket.
     */
    @Column(name = "user_id", nullable = false)
    private Integer user_id;

    /**
     * Timestamp when the ticket was created.
     */
    @Column(name = "created_at", nullable = false)
    private LocalDateTime created_at;

    /**
     * Current medications of the ordonnance.
     */
    @Column(name = "medications", nullable = false)
    private String medications;

    /**
     * Gets the unique identifier of the ordonnance.
     *
     * @return the ordonnance ID
     */
    public Integer getId() {
        return id;
    }

    /**
     * Sets the unique identifier of the ordonnance.
     *
     * @param id the ordonnance ID
     */
    public void setId(Integer id) {
        this.id = id;
    }

    /**
     * Gets the doctor's name of the ordonnance.
     *
     * @return the ordonnance title
     */
    public String getDoctor() {
        return doctor_name;
    }

    /**
     * Sets the doctor's name.
     *
     * @param doctor name
     */
    public void setDoctor(String doctor) {
        this.doctor_name = doctor;
    }

    /**
     * Gets the identifier of the user who created the ordonnance.
     *
     * @return the user ID
     */
    public Integer getUserId() {
        return user_id;
    }

    /**
     * Sets the identifier of the user who created the ordonnance.
     *
     * @param userId the user ID
     */
    public void setUserId(Integer userId) {
        this.user_id = userId;
    }

    /**
     * Gets the timestamp when the ticket was created.
     *
     * @return the creation timestamp
     */
    public LocalDateTime getCreatedAt() {
        return created_at;
    }

    /**
     * Sets the timestamp when the ticket was created.
     *
     * @param createdAt the creation timestamp
     */
    public void setCreatedAt(LocalDateTime createdAt) {
        this.created_at = createdAt;
    }
}