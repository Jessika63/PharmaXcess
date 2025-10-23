package com.pharmaxcess_server.pharmaxcess_server.dto;


/**
 * The FamilyDisabilityCreationRequest class represents a request to create an ordonnance.
 * It provides constructors to initialize data getter and setter methods to access.
 */
public class FamilyDisabilityCreationRequest {

    private String name;
    private int user_id;
    private String familymember;
    private String severity;
    private String treatement;

    /**
     * Default constructor for FamilyDisabilityCreationRequest.
     */
    public FamilyDisabilityCreationRequest() {
    }

    /**
     * Returns the name associated with this FamilyDisabilityCreationRequest.
     *
     * @return the name as a String
     */
    public String getName() {
        return name;
    }

    /**
     * Sets the name associated with this FamilyDisabilityCreationRequest.
     *
     * @param name as a String
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Returns the user_id associated with this FamilyDisabilityCreationRequest.
     *
     * @return the user_id as an int
     */
    public int getUser_id() {
        return user_id;
    }

    /**
     * Sets the user_id associated with this FamilyDisabilityCreationRequest.
     *
     * @param user_id as a Int
     */
    public void setUser_id(int user_id) {
        this.user_id = user_id;
    }

    /**
     * Returns the familymember associated with this FamilyDisabilityCreationRequest.
     *
     * @return the familymember as a String
     */
    public String getFamilyMember() {
        return familymember;
    }

    /**
     * Sets the familymember associated with this FamilyDisabilityCreationRequest.
     *
     * @param familymember the familymember as a String
     */
    public void setFamilyMember(String familymember) {
        this.familymember = familymember;
    }

    /**
     * Returns the severity associated with this FamilyDisabilityCreationRequest.
     *
     * @return the severity as a String
     */
    public String getSeverity() {
        return severity;
    }

    /**
     * Sets the severity associated with this FamilyDisabilityCreationRequest.
     *
     * @param severity the severity as a String
     */
    public void setSeverity(String severity) {
        this.severity = severity;
    }

    /**
     * Returns the treatement associated with this FamilyDisabilityCreationRequest.
     *
     * @return the treatement as a String
     */
    public String getTreatement() {
        return treatement;
    }

    /**
     * Sets the treatement associated with this FamilyDisabilityCreationRequest.
     *
     * @param treatement the treatement as a String
     */
    public void setTreatement(String treatement) {
        this.treatement = treatement;
    }
}