package com.pharmaxcess_server.pharmaxcess_server.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.pharmaxcess_server.pharmaxcess_server.dto.Pharmacy;

import java.util.ArrayList;
import java.util.List;

/**
 * Service for retrieving nearby pharmacies using the Overpass API (OpenStreetMap).
 * <p>
 * This service sends a query to the Overpass API to fetch pharmacies
 * (nodes with the tag {@code amenity=pharmacy}) within a 10 km radius
 * of the provided latitude and longitude. The results are parsed into
 * {@link Pharmacy} objects containing ID, name (if available), and geographic coordinates.
 * </p>
 */
@Service
public class PharmacyService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Retrieves a list of pharmacies near the given geographic coordinates.
     * <p>
     * This method queries the Overpass API with an Overpass QL query, requesting
     * all nodes tagged as {@code amenity=pharmacy} within a 10 km radius
     * around the given latitude and longitude. The response is parsed into
     * a list of {@link Pharmacy} objects.
     * </p>
     *
     * @param latitude  the latitude of the user's location
     * @param longitude the longitude of the user's location
     * @return a list of nearby {@link Pharmacy} objects; the list may be empty if none are found
     * @throws RuntimeException if the Overpass response cannot be parsed
     */
    public List<Pharmacy> getNearestPharmacies(double latitude, double longitude) {
        String query = String.format("""
            [out:json];
            node["amenity"="pharmacy"](around:5000,%f,%f);
            out;
            """, latitude, longitude);

        String url = "https://overpass-api.de/api/interpreter";
        String response = restTemplate.postForObject(url, query, String.class);

        List<Pharmacy> pharmacies = new ArrayList<>();
        try {
            JsonNode root = objectMapper.readTree(response);
            if (root.has("elements")) {
                for (JsonNode element : root.get("elements")) {
                    Pharmacy pharmacy = new Pharmacy();
                    pharmacy.setId(element.get("id").asLong());
                    pharmacy.setLat(element.get("lat").asDouble());
                    pharmacy.setLon(element.get("lon").asDouble());

                    if (element.has("tags") && element.get("tags").has("name"))
                        pharmacy.setName(element.get("tags").get("name").asText());
                    else
                        pharmacy.setName("Unknown");

                    pharmacies.add(pharmacy);
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Overpass response", e);
        }

        return pharmacies;
    }
}
