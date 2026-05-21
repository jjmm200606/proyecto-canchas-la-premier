package com.lapremier.canchas.service;

import com.lapremier.canchas.dto.LoginRequest;
import com.lapremier.canchas.dto.UsuarioRegistroRequest;
import com.lapremier.canchas.model.Usuario;
import com.lapremier.canchas.repository.UsuarioRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public Usuario registrar(UsuarioRegistroRequest request) {
        if (request.nombre == null || request.email == null || request.password == null ||
                request.nombre.isBlank() || request.email.isBlank() || request.password.isBlank()) {
            throw new RuntimeException("Nombre, email y password son obligatorios");
        }

        String email = request.email.trim().toLowerCase();

        if (usuarioRepository.existsByEmail(email)) {
            throw new RuntimeException("Ya existe un usuario con ese correo");
        }

        Usuario usuario = new Usuario();
        usuario.nombre = request.nombre;
        usuario.email = email;
        usuario.password = passwordEncoder.encode(request.password);
        usuario.telefono = request.telefono != null ? request.telefono : "";
        usuario.rol = (request.rol != null && !request.rol.isBlank()) ? request.rol : "cliente";
        usuario.activo = true;
        usuario.fechaRegistro = new Date();

        return usuarioRepository.save(usuario);
    }

   public Usuario login(LoginRequest request) {
    if (request.email == null || request.password == null ||
            request.email.isBlank() || request.password.isBlank()) {
        throw new RuntimeException("Email y password son obligatorios");
    }

    String email = request.email.trim().toLowerCase();

    Usuario usuario = usuarioRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

    boolean passwordValido =
            passwordEncoder.matches(request.password, usuario.password) ||
            request.password.equals(usuario.password);

    if (!passwordValido) {
        throw new RuntimeException("Contraseña incorrecta");
    }

    if (!Boolean.TRUE.equals(usuario.activo)) {
        throw new RuntimeException("Usuario inactivo");
    }

    if (!"admin".equalsIgnoreCase(usuario.rol)) {
        throw new RuntimeException("Solo el administrador puede iniciar sesión");
    }

    return usuario;
}

    public List<Usuario> listar() {
        return usuarioRepository.findAll();
        
    }
}