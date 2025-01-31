package com.pharmaxcess_server.pharmaxcess_server.model;

import java.time.LocalDateTime;
import jakarta.persistence.*;

/**
 * Represents a message associated with a ticket in the PharmaXcess system.
 * This entity is mapped to the "ticket_message" table in the database.
 * Each message is associated with a specific ticket and user.
 */
@Entity
@Table(name = "ticket_message")
public class TicketMessage {
    /**
     * Unique identifier for the message.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    /**
     * Identifier of the related ticket.
     */
    @Column(name = "ticket_id", nullable = false)
    private Long ticketId;

    /**
     * Identifier of the user who sent the message.
     */
    @Column(name = "user_id", nullable = false)
    private Integer userId;

    /**
     * Content of the message.
     */
    @Column(name = "message", nullable = false)
    private String message;

    /**
     * Timestamp when the message was created.
     */
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    /**
     * Gets the unique identifier of the ticket message.
     *
     * @return the unique identifier of the ticket message.
     */
    public Integer getId() {
        return id;
    }

    /**
     * Sets the unique identifier of the ticket message.
     *
     * @param id the unique identifier of the ticket message.
     */
    public void setId(Integer id) {
        this.id = id;
    }

    /**
     * Gets the identifier of the ticket associated with this message.
     *
     * @return the identifier of the ticket associated with this message.
     */
    public Long getTicketId() {
        return ticketId;
    }

    /**
     * Sets the identifier of the ticket associated with this message.
     *
     * @param ticketId the identifier of the ticket associated with this message.
     */
    public void setTicketId(Long ticketId) {
        this.ticketId = ticketId;
    }

    /**
     * Gets the identifier of the user who created this message.
     *
     * @return the identifier of the user who created this message.
     */
    public Integer getUserId() {
        return userId;
    }

    /**
     * Sets the identifier of the user who created this message.
     *
     * @param userId the identifier of the user who created this message.
     */
    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    /**
     * Gets the content of the message.
     *
     * @return the content of the message.
     */
    public String getMessage() {
        return message;
    }

    /**
     * Sets the content of the message.
     *
     * @param message the content of the message.
     */
    public void setMessage(String message) {
        this.message = message;
    }

    /**
     * Gets the timestamp when the message was created.
     *
     * @return the timestamp when the message was created.
     */
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    /**
     * Sets the timestamp when the message was created.
     *
     * @param createdAt the timestamp when the message was created.
     */
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
