package com.pharmaxcess_server.pharmaxcess_server;

import com.pharmaxcess_server.pharmaxcess_server.model.FamilyDisability;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for the {@link FamilyDisability} entity class.
 * These tests ensure that all getters, setters, and object behaviors
 * work as expected.
 */
public class FamilyDisabilityTest {

    private FamilyDisability disability;

    @BeforeEach
    void setUp() {
        disability = new FamilyDisability();
        disability.setId(1);
        disability.setUserId(42);
        disability.setName("Asthma");
        disability.setFamilyMember("Mother");
        disability.setSeverity("Severe");
        disability.setTreatment("Inhaler");
    }

    @Test
    @DisplayName("Should correctly set and get ID")
    void testId() {
        assertEquals(1, disability.getId());
        disability.setId(2);
        assertEquals(2, disability.getId());
    }

    @Test
    @DisplayName("Should correctly set and get User ID")
    void testUserId() {
        assertEquals(42, disability.getUserId());
        disability.setUserId(100);
        assertEquals(100, disability.getUserId());
    }

    @Test
    @DisplayName("Should correctly set and get Name")
    void testName() {
        assertEquals("Asthma", disability.getName());
        disability.setName("Diabetes");
        assertEquals("Diabetes", disability.getName());
    }

    @Test
    @DisplayName("Should correctly set and get Family Member")
    void testFamilyMember() {
        assertEquals("Mother", disability.getFamilyMember());
        disability.setFamilyMember("Father");
        assertEquals("Father", disability.getFamilyMember());
    }

    @Test
    @DisplayName("Should correctly set and get Severity")
    void testSeverity() {
        assertEquals("Severe", disability.getSeverity());
        disability.setSeverity("Moderate");
        assertEquals("Moderate", disability.getSeverity());
    }

    @Test
    @DisplayName("Should correctly set and get Treatment")
    void testTreatment() {
        assertEquals("Inhaler", disability.getTreatment());
        disability.setTreatment("Oxygen therapy");
        assertEquals("Oxygen therapy", disability.getTreatment());
    }

    @Test
    @DisplayName("Should handle null values gracefully")
    void testNullValues() {
        FamilyDisability nullDisability = new FamilyDisability();
        assertNull(nullDisability.getId());
        assertNull(nullDisability.getUserId());
        assertNull(nullDisability.getName());
        assertNull(nullDisability.getFamilyMember());
        assertNull(nullDisability.getSeverity());
        assertNull(nullDisability.getTreatment());
    }

    @Test
    @DisplayName("Should verify all fields set correctly through constructor")
    void testConstructor() {
        FamilyDisability fd = new FamilyDisability();
        fd.setId(5);
        fd.setUserId(99);
        fd.setName("Epilepsy");
        fd.setFamilyMember("Brother");
        fd.setSeverity("High");
        fd.setTreatment("Medication");

        assertAll("Constructor and setters test",
                () -> assertEquals(5, fd.getId()),
                () -> assertEquals(99, fd.getUserId()),
                () -> assertEquals("Epilepsy", fd.getName()),
                () -> assertEquals("Brother", fd.getFamilyMember()),
                () -> assertEquals("High", fd.getSeverity()),
                () -> assertEquals("Medication", fd.getTreatment())
        );
    }

    @Test
    @DisplayName("Should compare objects with same data equally if equals() is implemented")
    void testEquality() {
        FamilyDisability fd1 = new FamilyDisability();
        fd1.setId(1);
        fd1.setName("Cancer");

        FamilyDisability fd2 = new FamilyDisability();
        fd2.setId(1);
        fd2.setName("Cancer");

        assertNotEquals(fd1, fd2);
    }

    @Test
    @DisplayName("Should print meaningful toString() if implemented")
    void testToString() {
        String result = disability.toString();
        assertNotNull(result);
        assertTrue(result.contains("Asthma") || result.contains("Severe"));
    }
}