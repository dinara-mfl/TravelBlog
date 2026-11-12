package org.example.backend.model;

import lombok.With;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Document(collection = "trips")
@With
public record Trip(@Id String id,
                   String name,
                   String description,
                   LocalDate startDate,
                   LocalDate endDate) {
}
