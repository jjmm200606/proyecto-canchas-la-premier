package com.lapremier.canchas.service;

import com.lapremier.canchas.model.Cancha;
import com.lapremier.canchas.repository.CanchaRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
public class CanchaService {

    private final CanchaRepository canchaRepository;

    public CanchaService(CanchaRepository canchaRepository) {
        this.canchaRepository = canchaRepository;
    }

    public List<Cancha> listarHabilitadas() {
        return canchaRepository.findByEstado("habilitada");
    }

    public List<Cancha> listarTodas() {
        return canchaRepository.findAll();
    }

    public List<Cancha> listar() {
        return canchaRepository.findAll();
    }

    public Cancha obtenerPorId(String id) {
        return canchaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cancha no encontrada"));
    }

    public Cancha obtenerPorNombre(String nombre) {
        return canchaRepository.findByNombre(nombre)
                .orElseThrow(() -> new RuntimeException("Cancha no encontrada"));
    }

    public Cancha crear(Cancha cancha) {
        prepararCancha(cancha, null);
        return canchaRepository.save(cancha);
    }

    public Cancha actualizar(String id, Cancha canchaActualizada) {
        Cancha existente = obtenerPorId(id);
        prepararCancha(canchaActualizada, existente);
        canchaActualizada.id = existente.id;
        return canchaRepository.save(canchaActualizada);
    }

    public Cancha cambiarEstado(String id, String estado) {
        Cancha cancha = obtenerPorId(id);
        cancha.estado = estado;
        prepararCancha(cancha, cancha);
        return canchaRepository.save(cancha);
    }

    public void eliminar(String id) {
        Cancha cancha = obtenerPorId(id);
        canchaRepository.delete(cancha);
    }

    private void prepararCancha(Cancha cancha, Cancha existente) {
        if (cancha == null) {
            throw new RuntimeException("Los datos de la cancha son obligatorios");
        }

        cancha.nombre = limpiarTexto(cancha.nombre);
        cancha.tipo = limpiarTexto(cancha.tipo);
        cancha.descripcion = cancha.descripcion == null ? null : cancha.descripcion.trim();

        if (cancha.nombre == null || cancha.nombre.isBlank()) {
            throw new RuntimeException("El nombre de la cancha es obligatorio");
        }

        if (cancha.tipo == null || cancha.tipo.isBlank()) {
            throw new RuntimeException("El tipo de cancha es obligatorio");
        }

        if (cancha.capacidad == null || cancha.capacidad <= 0) {
            throw new RuntimeException("La capacidad debe ser mayor que cero");
        }

        if (cancha.ubicacion == null) {
            cancha.ubicacion = new Cancha.Ubicacion();
        }

        cancha.ubicacion.direccion = limpiarTexto(cancha.ubicacion.direccion);
        cancha.ubicacion.ciudad = limpiarTextoConDefecto(cancha.ubicacion.ciudad, "Villavicencio");
        cancha.ubicacion.departamento = limpiarTextoConDefecto(cancha.ubicacion.departamento, "Meta");

        if (cancha.contacto == null) {
            cancha.contacto = new Cancha.Contacto();
        }

        cancha.contacto.telefono = limpiarTextoConDefecto(cancha.contacto.telefono, "3124342025");
        cancha.contacto.whatsapp = limpiarTextoConDefecto(cancha.contacto.whatsapp, cancha.contacto.telefono);

        if (cancha.horarioAtencion == null) {
            cancha.horarioAtencion = new Cancha.HorarioAtencion();
        }

        cancha.horarioAtencion.apertura = limpiarTextoConDefecto(cancha.horarioAtencion.apertura, "08:00");
        cancha.horarioAtencion.cierre = limpiarTextoConDefecto(cancha.horarioAtencion.cierre, "22:00");

        if (cancha.estado == null || cancha.estado.isBlank()) {
            cancha.estado = existente != null && existente.estado != null && !existente.estado.isBlank()
                    ? existente.estado
                    : "habilitada";
        } else {
            cancha.estado = cancha.estado.trim().toLowerCase();
        }

        if (cancha.imagenes == null) {
            cancha.imagenes = existente != null && existente.imagenes != null
                    ? new ArrayList<>(existente.imagenes)
                    : new ArrayList<>();
        }

        if (cancha.tarifas == null) {
            cancha.tarifas = existente != null && existente.tarifas != null
                    ? new ArrayList<>(existente.tarifas)
                    : new ArrayList<>();
        }

        if (cancha.descripcion == null || cancha.descripcion.isBlank()) {
            cancha.descripcion = "Cancha de " + cancha.tipo;
        }

        cancha.fechaCreacion = cancha.fechaCreacion != null
                ? cancha.fechaCreacion
                : (existente != null && existente.fechaCreacion != null ? existente.fechaCreacion : new Date());
    }

    private String limpiarTexto(String valor) {
        return valor == null ? null : valor.trim();
    }

    private String limpiarTextoConDefecto(String valor, String defecto) {
        String limpio = limpiarTexto(valor);
        return (limpio == null || limpio.isBlank()) ? defecto : limpio;
    }
}
