package org.example.backend.service;

import org.example.backend.model.Trip;
import org.example.backend.repository.TripRepo;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TripService {

    private final TripRepo tripRepo;

    public TripService(TripRepo tripRepo) {
        this.tripRepo = tripRepo;
    }

    public List<Trip> getAllTrips() {
        return tripRepo.findAll();
    }
}
