package com.pharmaxcess_server.pharmaxcess_server.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Represents a medical history record for a specific user.
 * This entity stores details about the patient's medical event such as
 * medication, doctor, hospital information, and time range.
 */
@Entity
@Table(name = "medicalhistory")
public class MedicalHistory {

    /**
     * Unique identifier for the medical history record.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Identifier of the user to whom this medical history belongs.
     * References the "users" table (foreign key).
     */
    @Column(name = "user_id", nullable = false)
    private Long userId;

    /**
     * A short title or name describing the medical event.
     */
    @Column(nullable = false)
    private String name;

    /**
     * Detailed description of the medical issue or treatment.
     */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    /**
     * Date and time when the medical issue or treatment started.
     */
    @Column(name = "begindate", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime beginDate;

    /**
     * Date and time when the medical issue or treatment ended.
     */
    @Column(name = "enddate", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime endDate;

    /**
     * Hospital department involved in the medical history (e.g., Cardiology, Oncology).
     */
    @Column(nullable = false)
    private String department;

    /**
     * Name of the hospital related to this medical history.
     */
    @Column(nullable = false)
    private String hospital;

    /**
     * Doctor responsible for treatment during the medical event.
     */
    @Column(nullable = false)
    private String doctor;

    /**
     * Medications prescribed or used during the medical event.
     */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String medications;

    /**
     * Default constructor required for JPA.
     */
    public MedicalHistory() {}

    /**
     * Full constructor for creating a new medical history entry.
     *
     * @param userId       ID of the user related to this medical history
     * @param name         Title of the medical record
     * @param description  Detailed medical description
     * @param beginDate    Start date of the medical event
     * @param endDate      End date of the medical event
     * @param department   Hospital department involved
     * @param hospital     Name of the hospital
     * @param doctor       Treating doctor
     * @param medications  List of medications involved
     */
    public MedicalHistory(Long userId, String name, String description, LocalDateTime beginDate,
                          LocalDateTime endDate, String department, String hospital,
                          String doctor, String medications) {
        this.userId = userId;
        this.name = name;
        this.description = description;
        this.beginDate = beginDate;
        this.endDate = endDate;
        this.department = department;
        this.hospital = hospital;
        this.doctor = doctor;
        this.medications = medications;
    }

    /** @return the medical history record ID */
    public Long getId() {
        return id;
    }

    /** @return the associated user's ID */
    public Long getUserId() {
        return userId;
    }

    /** @param userId sets the associated user's ID */
    public void setUserId(Long userId) {
        this.userId = userId;
    }

    /** @return name of the medical record */
    public String getName() {
        return name;
    }

    /** @param name sets the medical record name */
    public void setName(String name) {
        this.name = name;
    }

    /** @return description of the medical record */
    public String getDescription() {
        return description;
    }

    /** @param description sets the detailed medical description */
    public void setDescription(String description) {
        this.description = description;
    }

    /** @return start date of the medical event */
    public LocalDateTime getBeginDate() {
        return beginDate;
    }

    /** @param beginDate sets the start date of the medical event */
    public void setBeginDate(LocalDateTime beginDate) {
        this.beginDate = beginDate;
    }

    /** @return end date of the medical event */
    public LocalDateTime getEndDate() {
        return endDate;
    }

    /** @param endDate sets the end date of the medical event */
    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    /** @return hospital department involved */
    public String getDepartment() {
        return department;
    }

    /** @param department sets the hospital department */
    public void setDepartment(String department) {
        this.department = department;
    }

    /** @return hospital name */
    public String getHospital() {
        return hospital;
    }

    /** @param hospital sets the hospital name */
    public void setHospital(String hospital) {
        this.hospital = hospital;
    }

    /** @return doctor treating the patient */
    public String getDoctor() {
        return doctor;
    }

    /** @param doctor sets the doctor name */
    public void setDoctor(String doctor) {
        this.doctor = doctor;
    }

    /** @return medications prescribed or used */
    public String getMedications() {
        return medications;
    }

    /** @param medications sets the medications used */
    public void setMedications(String medications) {
        this.medications = medications;
    }
}
