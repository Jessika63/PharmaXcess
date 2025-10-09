package com.pharmaxcess_server.pharmaxcess_server.model;

import jakarta.persistence.*;

/**
 * Represents a support doctor in the system.
 */
@Entity
@Table(name = "doctors")
public class Doctor {

    /**
     * Unique identifier for the ticket.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    /**
     * Doctor's name.
     */
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    /**
     * Doctor's speciality.
     */
    @Column(name = "speciality", nullable = false, length = 100)
    private String speciality;

    /**
     * Doctor's phone number.
     */
    @Column(name = "phonenumber", nullable = false, length = 100)
    private String phoneNumber;

    /**
     * Doctor's phone email.
     */
    @Column(name = "email", nullable = false, length = 100)
    private String email;

    /**
     * Doctor's address.
     */
    @Column(name = "address", nullable = false, length = 100)
    private String address;

    /**
     * Doctor's hospital.
     */
    @Column(name = "hospital", nullable = false, length = 100)
    private String hospital;

    /**
     * Gets the unique identifier of the doctor.
     *
     * @return the doctor ID
     */
    public Integer getId() {
        return id;
    }

    /**
     * Sets the unique identifier of the doctor.
     *
     * @param id the doctor ID
     */
    public void setId(Integer id) {
        this.id = id;
    }

    /**
     * Gets the doctor's name of the doctor.
     *
     * @return the doctor name
     */
    public String getDoctor() {
        return name;
    }

    /**
     * Sets the doctor's name.
     *
     * @param doctor name
     */
    public void setDoctor(String doctor) {
        this.name = doctor;
    }

    /**
     * Gets the doctor's speciality of the doctor.
     *
     * @return the doctor speciality
     */
    public String getSpeciality() {
        return speciality;
    }

    /**
     * Sets the doctor's speciality.
     *
     * @param speciality speciality
     */
    public void setSpeciality(String speciality) {
        this.speciality = speciality;
    }

    /**
     * Gets the doctor's phone number of the doctor.
     *
     * @return the doctor phone number
     */
    public String getPhoneNumber() {
        return phoneNumber;
    }

    /**
     * Sets the doctor's phone number.
     *
     * @param phoneNumber phone number
     */
    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    /**
     * Gets the doctor's phone email of the doctor.
     *
     * @return the doctor email
     */
    public String getEmail() {
        return email;
    }

    /**
     * Sets the doctor's phone email.
     *
     * @param email email
     */
    public void setEmail(String email) {
        this.email = email;
    }

    /**
     * Gets the doctor's address of the doctor.
     *
     * @return the doctor address
     */
    public String getAddress() {
        return address;
    }

    /**
     * Sets the doctor's address.
     *
     * @param address address
     */
    public void setAddress(String address) {
        this.address = address;
    }

    /**
     * Gets the doctor's hospital of the doctor.
     *
     * @return the doctor hospital
     */
    public String getHospital() {
        return hospital;
    }

    /**
     * Sets the doctor's hospital.
     *
     * @param hospital hospital
     */
    public void setHospital(String hospital) {
        this.hospital = hospital;
    }
}