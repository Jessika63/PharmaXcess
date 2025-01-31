package com.pharmaxcess_server.pharmaxcess_server.dto;

/**
 * The TicketRequest class represents a request for a ticket with two integer properties, x and y.
 * It provides getter and setter methods to access and modify these properties.
 */
public class TicketRequest {

    private Integer x;
    private Integer y;

    /**
     * Gets the value of x.
     *
     * @return the value of x
     */
    public Integer getX() {
        return x;
    }

    /**
     * Sets the value of x.
     *
     * @param x the value to set for x
     */
    public void setX(Integer x) {
        this.x = x;
    }

    /**
     * Gets the value of y.
     *
     * @return the value of y
     */
    public Integer getY() {
        return y;
    }

    /**
     * Sets the value of y.
     *
     * @param y the value to set for y
     */
    public void setY(Integer y) {
        this.y = y;
    }
}