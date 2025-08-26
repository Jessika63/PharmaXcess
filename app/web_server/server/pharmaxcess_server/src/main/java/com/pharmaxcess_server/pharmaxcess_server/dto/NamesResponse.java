package com.pharmaxcess_server.pharmaxcess_server.dto;

import java.util.HashMap;
import java.util.Map;

/**
 * Represents a response containing parsed name information, raw input text,
 * optional hints, and an error message if applicable.
 */
public class NamesResponse {

    private String firstName;
    private String lastName;
    private String rawText;
    private Map<String, String> hints = new HashMap<>();
    private String error;

    /**
     * Gets the extracted first name from the input.
     * @return the first name, or null if not set
     */
    public String getFirstName() {
        return firstName;
    }

    /**
     * Sets the first name.
     * @param firstName the first name to set
     */
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    /**
     * Gets the extracted last name from the input.
     * @return the last name, or null if not set
     */
    public String getLastName() {
        return lastName;
    }

    /**
     * Sets the last name.
     * @param lastName the last name to set
     */
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    /**
     * Gets the raw text from which the names were extracted.
     * @return the raw input text
     */
    public String getRawText() {
        return rawText;
    }

    /**
     * Sets the raw input text.
     * @param rawText the raw text to set
     */
    public void setRawText(String rawText) {
        this.rawText = rawText;
    }

    /**
     * Gets the map of hints containing additional information.
     * @return a map of hint keys and values
     */
    public Map<String, String> getHints() {
        return hints;
    }

    /**
     * Sets the map of hints.
     * @param hints a map of hint keys and values
     */
    public void setHints(Map<String, String> hints) {
        this.hints = hints;
    }

    /**
     * Gets the error message if there was an error.
     * @return the error message, or null if there is no error
     */
    public String getError() {
        return error;
    }

    /**
     * Creates a NamesResponse instance containing an error message.
     * @param message the error message
     * @return a NamesResponse with the error set
     */
    public static NamesResponse withError(String message) {
        NamesResponse response = new NamesResponse();
        response.setError(message);
        return response;
    }

    /**
     * Sets the error message.
     * @param error the error message to set
     */
    public void setError(String error) {
        this.error = error;
    }
}