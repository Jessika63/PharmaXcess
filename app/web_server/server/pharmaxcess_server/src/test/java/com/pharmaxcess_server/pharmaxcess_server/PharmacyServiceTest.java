package com.pharmaxcess_server.pharmaxcess_server;

import com.pharmaxcess_server.pharmaxcess_server.dto.Pharmacy;
import com.pharmaxcess_server.pharmaxcess_server.service.PharmacyService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class PharmacyServiceTest {

    @Autowired
    private PharmacyService pharmacyService;

    @Test
    void testGetNearestPharmacies() {
        double lat = 48.8566; // Paris
        double lon = 2.3522;

        List<Pharmacy> pharmacies = pharmacyService.getNearestPharmacies(lat, lon);

        assertNotNull(pharmacies);
        assertFalse(pharmacies.isEmpty());
        assertTrue(pharmacies.get(0).getName().length() > 0);
    }
}
