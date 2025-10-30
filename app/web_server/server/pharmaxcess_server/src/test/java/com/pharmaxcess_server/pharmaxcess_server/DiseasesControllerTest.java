package com.pharmaxcess_server.pharmaxcess_server;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pharmaxcess_server.pharmaxcess_server.dto.DiseaseCreationRequest;
import com.pharmaxcess_server.pharmaxcess_server.controller.DiseasesController;
import com.pharmaxcess_server.pharmaxcess_server.dto.IDDto;
import com.pharmaxcess_server.pharmaxcess_server.model.Disease;
import com.pharmaxcess_server.pharmaxcess_server.service.DiseaseService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;

/**
 * Unit tests for the DiseasesController class.
 * Tests cover all endpoints: /get, /create, and /delete.
 */
@WebMvcTest(DiseasesController.class)
public class DiseasesControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DiseaseService diseaseService;

    @Autowired
    private ObjectMapper objectMapper;

    private Disease disease1;
    private Disease disease2;

    /**
     * Sets up mock disease data before each test.
     */
    @BeforeEach
    public void setUp() {
        disease1 = new Disease();
        disease1.setId(1);
        disease1.setName("Asthma");

        disease2 = new Disease();
        disease2.setId(2);
        disease2.setName("Diabetes");
    }

    /**
     * Tests the GET /api/diseases/get endpoint.
     * Ensures the list of diseases is retrieved successfully.
     */
    @Test
    @WithMockUser(roles = "USER")
    public void testGetUserDiseases() throws Exception {
        List<Disease> mockDiseases = Arrays.asList(disease1, disease2);
        when(diseaseService.getUserDisease(1)).thenReturn(mockDiseases);

        mockMvc.perform(get("/api/diseases/get")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().json(objectMapper.writeValueAsString(mockDiseases)));

        verify(diseaseService, times(1)).getUserDisease(1);
    }

    /**
     * Tests the POST /api/diseases/create endpoint.
     * Ensures a disease can be created successfully.
     */
    @Test
    @WithMockUser(roles = "USER")
    public void testCreateDiseases() throws Exception {
        DiseaseCreationRequest request = new DiseaseCreationRequest();
        request.setName("Hypertension");
        //request.setSeverity("Moderate");

        when(diseaseService.createDisease(any(DiseaseCreationRequest.class))).thenReturn(1);

        mockMvc.perform(post("/api/diseases/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().string("1"));

        verify(diseaseService, times(1)).createDisease(any(DiseaseCreationRequest.class));
    }

    /**
     * Tests the POST /api/diseases/delete endpoint.
     * Ensures a disease can be deleted successfully.
     */
    @Test
    @WithMockUser(roles = "USER")
    public void testDeleteDiseases() throws Exception {
        IDDto idDto = new IDDto();
        idDto.setId(1);

        when(diseaseService.deleteDisease(any(IDDto.class))).thenReturn(1);

        mockMvc.perform(post("/api/diseases/delete")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(idDto)))
                .andExpect(status().isOk())
                .andExpect(content().string("1"));

        verify(diseaseService, times(1)).deleteDisease(any(IDDto.class));
    }

    /**
     * Tests behavior when no authentication is provided.
     * Ensures access is denied without a valid role.
     */
    @Test
    public void testUnauthorizedAccess() throws Exception {
        mockMvc.perform(get("/api/diseases/get"))
                .andExpect(status().isForbidden());
    }
}
