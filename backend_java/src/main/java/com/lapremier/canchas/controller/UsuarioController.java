package com.lapremier.canchas.controller;

import com.lapremier.canchas.dto.LoginRequest;
import com.lapremier.canchas.dto.UsuarioRegistroRequest;
import com.lapremier.canchas.model.Usuario;
import com.lapremier.canchas.service.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping("/registro")
    public ResponseEntity<?> registrar(@RequestBody UsuarioRegistroRequest request) {
        try {
            Usuario usuario = usuarioService.registrar(request);

            Map<String, Object> resp = new LinkedHashMap<>();
            resp.put("ok", true);
            resp.put("mensaje", "Usuario registrado correctamente");

            Map<String, Object> usuarioResp = new LinkedHashMap<>();
            usuarioResp.put("id", usuario.id);
            usuarioResp.put("nombre", usuario.nombre);
            usuarioResp.put("email", usuario.email);
            usuarioResp.put("rol", usuario.rol);
            usuarioResp.put("telefono", usuario.telefono);

            resp.put("usuario", usuarioResp);

            return ResponseEntity.status(HttpStatus.CREATED).body(resp);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "ok", false,
                    "mensaje", e.getMessage()
            ));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            Usuario usuario = usuarioService.login(request);

            Map<String, Object> resp = new LinkedHashMap<>();
            resp.put("ok", true);
            resp.put("mensaje", "Login correcto");

            Map<String, Object> usuarioResp = new LinkedHashMap<>();
            usuarioResp.put("id", usuario.id);
            usuarioResp.put("nombre", usuario.nombre);
            usuarioResp.put("email", usuario.email);
            usuarioResp.put("rol", usuario.rol);
            usuarioResp.put("telefono", usuario.telefono);

            resp.put("usuario", usuarioResp);

            return ResponseEntity.ok(resp);
        } catch (RuntimeException e) {
            HttpStatus status = e.getMessage().equals("Usuario no encontrado") ? HttpStatus.NOT_FOUND : HttpStatus.UNAUTHORIZED;
            return ResponseEntity.status(status).body(Map.of(
                    "ok", false,
                    "mensaje", e.getMessage()
            ));
        }
    }

    @GetMapping
    public ResponseEntity<?> listar() {
        List<Usuario> usuarios = usuarioService.listar();
        usuarios.forEach(u -> u.password = null);

        return ResponseEntity.ok(Map.of(
                "ok", true,
                "total", usuarios.size(),
                "usuarios", usuarios
        ));
    }
}
