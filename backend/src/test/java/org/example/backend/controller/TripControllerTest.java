package org.example.backend.controller;

import org.example.backend.model.Trip;
import org.example.backend.repository.TripRepo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import java.time.LocalDate;

@SpringBootTest
@AutoConfigureMockMvc
class TripControllerTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private TripRepo tripRepo;

    @BeforeEach
    void setUp() {
        tripRepo.deleteAll();
    }

    @Test
    void getAllTrips_returnsSavedTrip() throws Exception {
        Trip trip = new Trip("1", "TestTrip", "Test", LocalDate.of(2024, 5, 12), LocalDate.of(2024, 5, 20));
        tripRepo.save(trip);

        mockMvc.perform(MockMvcRequestBuilders.get("/api/trips"))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.content().json("""
                        [
                          {
                            "id": "1",
                            "title": "TestTrip",
                            "description": "Test",
                            "startDate": "2024-05-12",
                            "endDate": "2024-05-20"
                          }
                        ]
                        """));
    }

    @Test
    void getAllTrips_returnsEmptyList_whenNoTripsExist() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/api/trips"))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.content().json("[]"));
    }
}
