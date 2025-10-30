package com.pharmaxcess_server.pharmaxcess_server;

import com.pharmaxcess_server.pharmaxcess_server.dto.AllergyCreationRequest;
import com.pharmaxcess_server.pharmaxcess_server.controller.AllergiesController;
import com.pharmaxcess_server.pharmaxcess_server.dto.IDDto;
import com.pharmaxcess_server.pharmaxcess_server.model.Allergy;
import com.pharmaxcess_server.pharmaxcess_server.service.AllergyService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link AllergiesController}.
 * This test class ensures that controller endpoints correctly delegate
 * calls to the {@link AllergyService} and return expected results.
 */
public class AllergiesControllerTest {

    @Mock
    private AllergyService allergyService;

    @InjectMocks
    private AllergiesController allergiesController;

    private Allergy allergy1;
    private Allergy allergy2;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        allergy1 = new Allergy();
        allergy1.setId(1);
        allergy1.setName("Peanuts");

        allergy2 = new Allergy();
        allergy2.setId(2);
        allergy2.setName("Dust");
    }

    @Test
    @DisplayName("Should return a list of user's allergies")
    void testGetUserAllergies() {
        when(allergyService.getUserAllergy(1)).thenReturn(List.of(allergy1, allergy2));

        List<Allergy> result = allergiesController.getUserAllergies();

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("Peanuts", result.get(0).getName());
        verify(allergyService, times(1)).getUserAllergy(1);
    }

    @Test
    @DisplayName("Should create a new allergy successfully")
    void testCreateAllergy() {
        AllergyCreationRequest request = new AllergyCreationRequest();
        request.setName("Pollen");
        request.setSeverity("High");
        request.setMedications("Antihistamines");

        when(allergyService.createAllergy(request)).thenReturn(1);

        int result = allergiesController.createAllergies(request);

        assertEquals(1, result);
        verify(allergyService, times(1)).createAllergy(request);
    }

    @Test
    @DisplayName("Should delete an allergy successfully")
    void testDeleteAllergy() {
        IDDto idDto = new IDDto();
        idDto.setId(1);

        when(allergyService.deleteAllergy(idDto)).thenReturn(1);

        int result = allergiesController.deleteAllergies(idDto);

        assertEquals(1, result);
        verify(allergyService, times(1)).deleteAllergy(idDto);
    }

    @Test
    @DisplayName("Should handle empty allergy list gracefully")
    void testEmptyAllergyList() {
        when(allergyService.getUserAllergy(1)).thenReturn(List.of());

        List<Allergy> result = allergiesController.getUserAllergies();

        assertTrue(result.isEmpty());
        verify(allergyService, times(1)).getUserAllergy(1);
    }

    @Test
    @DisplayName("Should handle exceptions from service gracefully")
    void testServiceThrowsException() {
        when(allergyService.getUserAllergy(1)).thenThrow(new RuntimeException("Database error"));

        RuntimeException thrown = assertThrows(RuntimeException.class, () -> {
            allergiesController.getUserAllergies();
        });

        assertEquals("Database error", thrown.getMessage());
        verify(allergyService, times(1)).getUserAllergy(1);
    }
}
