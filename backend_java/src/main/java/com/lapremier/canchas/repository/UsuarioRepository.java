package com.lapremier.canchas.repository;

import com.lapremier.canchas.model.Usuario;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UsuarioRepository extends MongoRepository<Usuario, String> {
    Optional<Usuario> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<Usuario> findByEmailAndPasswordAndRolAndActivoTrue(String email, String password, String rol);
}