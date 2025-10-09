package com.pharmaxcess_server.pharmaxcess_server.dto;

/**
 * The DoctorCreationRequest class represents a request to create an doctor.
 * It provides constructors to initialize data getter and setter methods to access.
 */
public class DoctorCreationRequest {

    private String name;
    private String speciality;
    private String phoneNumber;
    private String email;
    private String address;
    private String hospital;


    /**
     * Default constructor for DoctorCreationRequest.
     */
    public DoctorCreationRequest() {
    }

    /**
     * Returns the name associated with this DoctorCreationRequest.
     *
     * @return the name as a String
     */
    public String getName() {
        return name;
    }

    /**
     * Sets the name associated with this DoctorCreationRequest.
     *
     * @param name as a String
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Returns the speciality associated with this DoctorCreationRequest.
     *
     * @return the speciality as a String
     */
    public String getSpeciality() {
        return speciality;
    }

    /**
     * Sets the speciality associated with this DoctorCreationRequest.
     *
     * @param speciality the speciality as a String
     */
    public void setSpeciality(String speciality) {
        this.speciality = speciality;
    }

    /**
     * Returns the phone number associated with this DoctorCreationRequest.
     *
     * @return the phone number as a String
     */
    public String getPhoneNumber() {
        return phoneNumber;
    }

    /**
     * Sets the phone number associated with this DoctorCreationRequest.
     *
     * @param phoneNumber the phone number as a String
     */
    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    /**
     * Returns the email associated with this DoctorCreationRequest.
     *
     * @return the email as a String
     */
    public String getEmail() {
        return email;
    }

    /**
     * Sets the email associated with this DoctorCreationRequest.
     *
     * @param email the email as a String
     */
    public void setEmail(String email) {
        this.email = email;
    }

    /**
     * Returns the address associated with this DoctorCreationRequest.
     *
     * @return the address as a String
     */
    public String getAddress() {
        return address;
    }

    /**
     * Sets the address associated with this DoctorCreationRequest.
     *
     * @param address the address as a String
     */
    public void setAddress(String address) {
        this.address = address;
    }

    /**
     * Returns the hospital associated with this DoctorCreationRequest.
     *
     * @return the hospital as a String
     */
    public String getHospital() {
        return hospital;
    }

    /**
     * Sets the hospital associated with this DoctorCreationRequest.
     *
     * @param hospital the hospital as a String
     */
    public void setHospital(String hospital) {
        this.hospital = hospital;
    }
}