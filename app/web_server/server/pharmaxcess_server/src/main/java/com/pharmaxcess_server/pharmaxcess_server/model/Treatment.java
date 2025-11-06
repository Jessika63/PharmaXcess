package com.pharmaxcess_server.pharmaxcess_server.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Represents a treatment taken by a specific user.
 * Stores details such as dosage, duration, disease, and any side effects.
 */
@Entity
@Table(name = "treatements") // Keep original SQL table name
public class Treatment {

    /**
     * Unique identifier of the treatment record.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Identifier of the user associated with this treatment.
     * References the "users" table.
     */
    @Column(name = "user_id", nullable = false)
    private Long userId;

    /**
     * Name of the treatment (ex: medication name or therapy).
     */
    @Column(nullable = false)
    private String name;

    /**
     * Date and time when the treatment started.
     */
    @Column(name = "begindate", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime beginDate;

    /**
     * Date and time when the treatment ended.
     */
    @Column(name = "enddate", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime endDate;

    /**
     * Dosage of the treatment (ex: 2x500mg per day).
     */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String dosage;

    /**
     * Duration of the treatment (ex: 7 days).
     */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String duration;

    /**
     * Possible or experienced side effects caused by the treatment.
     */
    @Column(name = "sideeffects", nullable = false, columnDefinition = "TEXT")
    private String sideEffects;

    /**
     * The disease or condition that the treatment targets.
     */
    @Column(nullable = false)
    private String disease;

    /**
     * Default constructor for JPA.
     */
    public Treatment() {}

    /**
     * Full constructor to initialize a treatment record.
     *
     * @param userId      ID of the related user
     * @param name        Treatment name
     * @param beginDate   Start date of the treatment
     * @param endDate     End date of the treatment
     * @param dosage      Dosage of the treatment
     * @param duration    Duration for which the treatment is taken
     * @param sideEffects Treatment side effects
     * @param disease     Disease or medical condition
     */
    public Treatment(Long userId, String name, LocalDateTime beginDate,
                     LocalDateTime endDate, String dosage, String duration,
                     String sideEffects, String disease) {
        this.userId = userId;
        this.name = name;
        this.beginDate = beginDate;
        this.endDate = endDate;
        this.dosage = dosage;
        this.duration = duration;
        this.sideEffects = sideEffects;
        this.disease = disease;
    }

    /** @return the treatment ID */
    public Long getId() {
        return id;
    }

    /** @return ID of the associated user */
    public Long getUserId() {
        return userId;
    }

    /** @param userId sets the associated user ID */
    public void setUserId(Long userId) {
        this.userId = userId;
    }

    /** @return the treatment name */
    public String getName() {
        return name;
    }

    /** @param name sets the treatment name */
    public void setName(String name) {
        this.name = name;
    }

    /** @return treatment's start date */
    public LocalDateTime getBeginDate() {
        return beginDate;
    }

    /** @param beginDate sets the start date of the treatment */
    public void setBeginDate(LocalDateTime beginDate) {
        this.beginDate = beginDate;
    }

    /** @return treatment's end date */
    public LocalDateTime getEndDate() {
        return endDate;
    }

    /** @param endDate sets the end date of the treatment */
    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    /** @return dosage of the treatment */
    public String getDosage() {
        return dosage;
    }

    /** @param dosage sets the treatment dosage */
    public void setDosage(String dosage) {
        this.dosage = dosage;
    }

    /** @return duration of the treatment */
    public String getDuration() {
        return duration;
    }

    /** @param duration sets the treatment duration */
    public void setDuration(String duration) {
        this.duration = duration;
    }

    /** @return described side effects */
    public String getSideEffects() {
        return sideEffects;
    }

    /** @param sideEffects sets treatment side effects */
    public void setSideEffects(String sideEffects) {
        this.sideEffects = sideEffects;
    }

    /** @return disease targeted by the treatment */
    public String getDisease() {
        return disease;
    }

    /** @param disease sets the targeted disease */
    public void setDisease(String disease) {
        this.disease = disease;
    }
}
