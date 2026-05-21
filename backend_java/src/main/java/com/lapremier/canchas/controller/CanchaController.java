package com.lapremier.canchas.controller;

import com.lapremier.canchas.model.Cancha;
import com.lapremier.canchas.service.CanchaService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/canchas")
public class CanchaController {

    private final CanchaService canchaService;

    public CanchaController(CanchaService canchaService) {
        this.canchaService = canchaService;
    }

    @GetMapping("/test")
    public String test() {
        return "CanchaController funcionando";
    }

    @GetMapping
    public List<Cancha> listarHabilitadas() {
        return canchaService.listarHabilitadas();
    }

    @GetMapping("/admin")
    public List<Cancha> listarTodas() {
        return canchaService.listarTodas();
    }

    @GetMapping("/{id}")
    public Cancha obtenerPorId(@PathVariable String id) {
        return canchaService.obtenerPorId(id);
    }

    @GetMapping("/nombre/{nombre}")
    public Cancha obtenerPorNombre(@PathVariable String nombre) {
        return canchaService.obtenerPorNombre(nombre);
    }

    @PostMapping
    public Cancha crear(@RequestBody Cancha cancha) {
        return canchaService.crear(cancha);
    }

    @PutMapping("/{id}")
    public Cancha actualizar(@PathVariable String id, @RequestBody Cancha cancha) {
        return canchaService.actualizar(id, cancha);
    }

    @PutMapping("/{id}/estado")
    public Cancha cambiarEstado(@PathVariable String id, @RequestParam String estado) {
        return canchaService.cambiarEstado(id, estado);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable String id) {
        canchaService.eliminar(id);
    }
}
