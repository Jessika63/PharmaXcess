package com.pharmaxcess_server.pharmaxcess_server.model;

import java.time.LocalDateTime;
import jakarta.persistence.*;

/**
 * Represents a support ticket in the system.
 */
@Entity
@Table(name = "tickets")
public class Ticket {

    /**
     * Unique identifier for the ticket.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    /**
     * Title of the ticket.
     */
    @Column(name = "title", nullable = false, length = 100)
    private String title;

    /**
     * Identifier of the user who created the ticket.
     */
    @Column(name = "user_id", nullable = false)
    private Integer userId;

    /**
     * Identifier of the user assigned to the ticket.
     * Can be null if not yet assigned.
     */
    @Column(name = "assigned_to", nullable = true)
    private Long assignedTo;

    /**
     * Timestamp when the ticket was created.
     */
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    /**
     * Timestamp when the ticket was last updated.
     */
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * Current status of the ticket.
     */
    @Column(name = "status", nullable = false)
    private String status;

    /**
     * Gets the unique identifier of the ticket.
     *
     * @return the ticket ID
     */
    public Integer getId() {
        return id;
    }

    /**
     * Sets the unique identifier of the ticket.
     *
     * @param id the ticket ID
     */
    public void setId(Integer id) {
        this.id = id;
    }

    /**
     * Gets the title of the ticket.
     *
     * @return the ticket title
     */
    public String getTitle() {
        return title;
    }

    /**
     * Sets the title of the ticket.
     *
     * @param title the ticket title
     */
    public void setTitle(String title) {
        this.title = title;
    }

    /**
     * Gets the identifier of the user who created the ticket.
     *
     * @return the user ID
     */
    public Integer getUserId() {
        return userId;
    }

    /**
     * Sets the identifier of the user who created the ticket.
     *
     * @param userId the user ID
     */
    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    /**
     * Gets the identifier of the user assigned to the ticket.
     *
     * @return the assigned user ID, or null if unassigned
     */
    public Long getAssignedTo() {
        return assignedTo;
    }

    /**
     * Sets the identifier of the user assigned to the ticket.
     *
     * @param assignedTo the assigned user ID
     */
    public void setAssignedTo(Long assignedTo) {
        this.assignedTo = assignedTo;
    }

    /**
     * Gets the timestamp when the ticket was created.
     *
     * @return the creation timestamp
     */
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    /**
     * Sets the timestamp when the ticket was created.
     *
     * @param createdAt the creation timestamp
     */
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    /**
     * Gets the timestamp when the ticket was last updated.
     *
     * @return the last update timestamp
     */
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    /**
     * Sets the timestamp when the ticket was last updated.
     *
     * @param updatedAt the last update timestamp
     */
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    /**
     * Gets the current status of the ticket.
     *
     * @return the ticket status
     */
    public String getStatus() {
        return status;
    }

    /**
     * Sets the current status of the ticket.
     *
     * @param status the ticket status
     */
    public void setStatus(String status) {
        this.status = status;
    }
}