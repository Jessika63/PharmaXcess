package com.pharmaxcess_server.pharmaxcess_server.dto;

import java.time.LocalDateTime;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Data Transfer Object used to carry information required to create
 * a new {@code MedicalHistory} record in the system.
 *
 * <p>This class is typically used in HTTP POST requests coming from
 * client applications. Validation annotations ensure that required
 * fields are properly provided before the medical history is created.</p>
 */
public class MedicalHistoryCreationRequest {

    /**
     * The ID of the user to whom this medical history entry belongs.
     * Must not be {@code null}.
     */
    @NotNull
    private Long userId;

    /**
     * Name or title for this medical history entry.
     * Must not be {@code null} or empty.
     */
    @NotBlank
    private String name;

    /**
     * Detailed description of the medical condition or situation.
     * Must not be {@code null} or empty.
     */
    @NotBlank
    private String description;

    /**
     * Date and time when the condition began.
     * Defaults to the current timestamp if not provided.
     */
    private LocalDateTime beginDate;

    /**
     * Date and time when the condition ended.
     * Defaults to the current timestamp if not provided.
     */
    private LocalDateTime endDate;

    /**
     * Name of the medical department where the user received treatment.
     * Must not be {@code null} or empty.
     */
    @NotBlank
    private String department;

    /**
     * Name of the hospital responsible for the treatment.
     * Must not be {@code null} or empty.
     */
    @NotBlank
    private String hospital;

    /**
     * Name of the doctor overseeing this medical history case.
     * Must not be {@code null} or empty.
     */
    @NotBlank
    private String doctor;

    /**
     * Medications associated with this medical history entry.
     * Must not be {@code null} or empty.
     */
    @NotBlank
    private String medications;

    // ----- GETTERS & SETTERS -----

    /**
     * Gets the user identifier.
     *
     * @return the ID of the user
     */
    public Long getUserId() {
        return userId;
    }

    /**
     * Sets the user identifier.
     *
     * @param userId the ID of the user
     */
    public void setUserId(Long userId) {
        this.userId = userId;
    }

    /**
     * Gets the entry name.
     *
     * @return the medical history name
     */
    public String getName() {
        return name;
    }

    /**
     * Sets the entry name.
     *
     * @param name the medical history name
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Gets the description of the condition.
     *
     * @return the condition description
     */
    public String getDescription() {
        return description;
    }

    /**
     * Sets the description of the condition.
     *
     * @param description the condition description
     */
    public void setDescription(String description) {
        this.description = description;
    }

    /**
     * Gets the start date of the medical history.
     *
     * @return the condition begin date
     */
    public LocalDateTime getBeginDate() {
        return beginDate;
    }

    /**
     * Sets the start date of the medical history.
     *
     * @param beginDate the condition begin date
     */
    public void setBeginDate(LocalDateTime beginDate) {
        this.beginDate = beginDate;
    }

    /**
     * Gets the end date of the medical history.
     *
     * @return the condition end date
     */
    public LocalDateTime getEndDate() {
        return endDate;
    }

    /**
     * Sets the end date of the medical history.
     *
     * @param endDate the condition end date
     */
    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    /**
     * Gets the medical department.
     *
     * @return the department name
     */
    public String getDepartment() {
        return department;
    }

    /**
     * Sets the medical department.
     *
     * @param department the department name
     */
    public void setDepartment(String department) {
        this.department = department;
    }

    /**
     * Gets the hospital name.
     *
     * @return the hospital name
     */
    public String getHospital() {
        return hospital;
    }

    /**
     * Sets the hospital name.
     *
     * @param hospital the hospital name
     */
    public void setHospital(String hospital) {
        this.hospital = hospital;
    }

    /**
     * Gets the doctor name.
     *
     * @return the doctor's name
     */
    public String getDoctor() {
        return doctor;
    }

    /**
     * Sets the doctor name.
     *
     * @param doctor the doctor's name
     */
    public void setDoctor(String doctor) {
        this.doctor = doctor;
    }

    /**
     * Gets the associated medications.
     *
     * @return the medications list
     */
    public String getMedications() {
        return medications;
    }

    /**
     * Sets the associated medications.
     *
     * @param medications the medications list
     */
    public void setMedications(String medications) {
        this.medications = medications;
    }
}
