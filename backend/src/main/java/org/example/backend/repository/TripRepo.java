package org.example.backend.repository;

import org.example.backend.model.Trip;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TripRepo extends MongoRepository<Trip, String> {
}
