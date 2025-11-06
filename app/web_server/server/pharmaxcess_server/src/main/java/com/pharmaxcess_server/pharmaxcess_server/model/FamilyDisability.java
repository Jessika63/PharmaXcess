package com.pharmaxcess_server.pharmaxcess_server.model;

import jakarta.persistence.*;

/**
 * Represents a family member's disability with details about the type,
 * description, and severity level of the disability.
 */
@Entity
@Table(name = "doctors")
public class FamilyDisability {

    /**
     * Unique identifier for the FamilyDisability.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    /**
     * The user ID associated with the family member's disability.
     */
    @Column(name = "user_id", nullable = false)
    private Integer userId;

    /**
     * The name of the disability.
     */
    @Column(name = "name", nullable = false)
    private String name;

    /**
     * The family member who has the disability.
     */
    @Column(name = "familymember", nullable = false)
    private String familyMember;

    /**
     * The severity level of the disability.
     */
    @Column(name = "severity", nullable = false)
    private String severity;

    /**
     * The treatment for the disability.
     */
    @Column(name = "treatement", nullable = false)
    private String treatment;

    /**
     * Returns the unique identifier of the record.
     *
     * @return the ID of the record
     */
    public Integer getId() {
        return id;
    }

    /**
     * Sets the unique identifier of the record.
     *
     * @param id the ID to set
     */
    public void setId(Integer id) {
        this.id = id;
    }

    /**
     * Returns the ID of the user associated with this record.
     *
     * @return the user ID
     */
    public Integer getUserId() {
        return userId;
    }

    /**
     * Sets the ID of the user associated with this record.
     *
     * @param userId the user ID to set
     */
    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    /**
     * Returns the name of the condition, disability, or relevant record.
     *
     * @return the name value
     */
    public String getName() {
        return name;
    }

    /**
     * Sets the name of the condition, disability, or relevant record.
     *
     * @param name the name value to set
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Returns the name of the affected family member.
     *
     * @return the family member's name
     */
    public String getFamilyMember() {
        return familyMember;
    }

    /**
     * Sets the name of the affected family member.
     *
     * @param familyMember the family member's name to set
     */
    public void setFamilyMember(String familyMember) {
        this.familyMember = familyMember;
    }

    /**
     * Returns the severity level of the condition or disability.
     *
     * @return the severity level
     */
    public String getSeverity() {
        return severity;
    }

    /**
     * Sets the severity level of the condition or disability.
     *
     * @param severity the severity level to set
     */
    public void setSeverity(String severity) {
        this.severity = severity;
    }

    /**
     * Returns the treatment or therapy associated with this record.
     *
     * @return the treatment description
     */
    public String getTreatment() {
        return treatment;
    }

    /**
     * Sets the treatment or therapy associated with this record.
     *
     * @param treatment the treatment description to set
     */
    public void setTreatment(String treatment) {
        this.treatment = treatment;
    }
}
