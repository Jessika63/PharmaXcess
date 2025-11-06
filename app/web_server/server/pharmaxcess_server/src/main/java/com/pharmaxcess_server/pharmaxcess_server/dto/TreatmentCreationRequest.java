package com.pharmaxcess_server.pharmaxcess_server.dto;

import java.time.LocalDateTime;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Data Transfer Object used to carry information required to create
 * a new {@code Treatment} record in the system.
 *
 * <p>This object is commonly used in HTTP POST requests. Validation
 * annotations ensure that required parameters are supplied before
 * the treatment is persisted.</p>
 */
public class TreatmentCreationRequest {

    /**
     * The ID of the user receiving the treatment.
     * Must not be {@code null}.
     */
    @NotNull
    private Long userId;

    /**
     * The name or title of the treatment.
     * Must not be {@code null} or empty.
     */
    @NotBlank
    private String name;

    /**
     * The date when the treatment started.
     * Defaults to the current timestamp if omitted.
     */
    private LocalDateTime beginDate;

    /**
     * The date when the treatment ended.
     * Defaults to the current timestamp if omitted.
     */
    private LocalDateTime endDate;

    /**
     * The prescribed dosage for the treatment.
     * Must not be {@code null} or empty.
     */
    @NotBlank
    private String dosage;

    /**
     * The duration of the treatment (e.g., number of weeks).
     * Must not be {@code null} or empty.
     */
    @NotBlank
    private String duration;

    /**
     * Possible or recorded side effects from the treatment.
     * Must not be {@code null} or empty.
     */
    @NotBlank
    private String sideEffects;

    /**
     * Name of the disease for which the treatment is prescribed.
     * Must not be {@code null} or empty.
     */
    @NotBlank
    private String disease;

    // ----- GETTERS & SETTERS -----

    /**
     * Gets the user identifier.
     *
     * @return the user ID
     */
    public Long getUserId() {
        return userId;
    }

    /**
     * Sets the user identifier.
     *
     * @param userId the user ID
     */
    public void setUserId(Long userId) {
        this.userId = userId;
    }

    /**
     * Gets the treatment name.
     *
     * @return the treatment name
     */
    public String getName() {
        return name;
    }

    /**
     * Sets the treatment name.
     *
     * @param name the treatment name
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Gets the begin date of the treatment.
     *
     * @return the begin date
     */
    public LocalDateTime getBeginDate() {
        return beginDate;
    }

    /**
     * Sets the begin date of the treatment.
     *
     * @param beginDate the begin date
     */
    public void setBeginDate(LocalDateTime beginDate) {
        this.beginDate = beginDate;
    }

    /**
     * Gets the end date of the treatment.
     *
     * @return the end date
     */
    public LocalDateTime getEndDate() {
        return endDate;
    }

    /**
     * Sets the end date of the treatment.
     *
     * @param endDate the end date
     */
    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    /**
     * Gets the dosage for the treatment.
     *
     * @return the dosage
     */
    public String getDosage() {
        return dosage;
    }

    /**
     * Sets the dosage for the treatment.
     *
     * @param dosage the dosage value
     */
    public void setDosage(String dosage) {
        this.dosage = dosage;
    }

    /**
     * Gets the duration of the treatment.
     *
     * @return the duration
     */
    public String getDuration() {
        return duration;
    }

    /**
     * Sets the duration of the treatment.
     *
     * @param duration the duration value
     */
    public void setDuration(String duration) {
        this.duration = duration;
    }

    /**
     * Gets the treatment's side effects.
     *
     * @return the side effects
     */
    public String getSideEffects() {
        return sideEffects;
    }

    /**
     * Sets the treatment's side effects.
     *
     * @param sideEffects the side effects list
     */
    public void setSideEffects(String sideEffects) {
        this.sideEffects = sideEffects;
    }

    /**
     * Gets the disease name targeted by the treatment.
     *
     * @return the disease name
     */
    public String getDisease() {
        return disease;
    }

    /**
     * Sets the disease name targeted by the treatment.
     *
     * @param disease the disease name
     */
    public void setDisease(String disease) {
        this.disease = disease;
    }
}
