package com.lapremier.canchas.repository;

import com.lapremier.canchas.model.Cancha;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface CanchaRepository extends MongoRepository<Cancha, String> {
    List<Cancha> findByEstado(String estado);
    Optional<Cancha> findByNombre(String nombre);
}