package com.lapremier.canchas.controller;

import com.lapremier.canchas.model.Cancha;
import com.lapremier.canchas.model.Reserva;
import com.lapremier.canchas.service.CanchaService;
import com.lapremier.canchas.service.ReservaService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reservas")
public class ReservaController {

    private final ReservaService reservaService;
    private final CanchaService canchaService;

    public ReservaController(ReservaService reservaService, CanchaService canchaService) {
        this.reservaService = reservaService;
        this.canchaService = canchaService;
    }

    @GetMapping
    public List<Reserva> listarReservas() {
        return reservaService.listar();
    }

    @GetMapping("/test")
    public String test() {
        return "ReservaController funcionando";
    }

    @GetMapping("/{id}")
    public Reserva obtenerReserva(@PathVariable String id) {
        return reservaService.obtenerPorId(id);
    }

    @GetMapping("/buscar")
    public List<Reserva> buscarPorCanchaYFecha(
            @RequestParam String canchaId,
            @RequestParam String fecha
    ) {
        validarCanchaHabilitadaPorId(canchaId);
        return reservaService.obtenerPorCanchaYFecha(canchaId, fecha);
    }

    @PostMapping
    public Reserva crearReserva(@RequestBody Reserva reserva) {
        validarCanchaHabilitadaPorId(reserva.getCanchaId());
        validarCruceHorario(reserva, null);
        return reservaService.guardar(reserva);
    }

    @PutMapping("/{id}")
    public Reserva actualizarReserva(@PathVariable String id, @RequestBody Reserva reserva) {
        validarCanchaHabilitadaPorId(reserva.getCanchaId());
        validarCruceHorario(reserva, id);
        return reservaService.actualizar(id, reserva);
    }

    @PatchMapping("/{id}/estado")
    public Reserva actualizarEstado(@PathVariable String id, @RequestBody Map<String, String> body) {
        return reservaService.actualizarEstado(id, body.get("estado"));
    }

    @DeleteMapping("/{id}")
    public String eliminarReserva(@PathVariable String id) {
        reservaService.eliminar(id);
        return "Reserva eliminada correctamente";
    }

    private void validarCanchaHabilitadaPorId(String canchaId) {
        if (canchaId == null || canchaId.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe enviar la cancha"
            );
        }

        Cancha cancha = canchaService.obtenerPorId(canchaId);

        if (cancha.estado == null || !cancha.estado.equalsIgnoreCase("habilitada")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La cancha está inhabilitada y no se puede reservar"
            );
        }
    }

    private void validarCruceHorario(Reserva nuevaReserva, String reservaActualId) {
        if (nuevaReserva.getCanchaId() == null || nuevaReserva.getFecha() == null ||
                nuevaReserva.getHoraInicio() == null || nuevaReserva.getHoraFin() == null) {
            return;
        }

        List<Reserva> reservasExistentes = reservaService.obtenerPorCanchaYFecha(
                nuevaReserva.getCanchaId(),
                nuevaReserva.getFecha()
        );

        for (Reserva existente : reservasExistentes) {
            if (reservaActualId != null && reservaActualId.equals(existente.getId())) {
                continue;
            }

            String estado = existente.getEstado() == null ? "" : existente.getEstado().toLowerCase();
            if (estado.equals("cancelada")) {
                continue;
            }

            boolean seCruza = horariosSeCruzan(
                    nuevaReserva.getHoraInicio(),
                    nuevaReserva.getHoraFin(),
                    existente.getHoraInicio(),
                    existente.getHoraFin()
            );

            if (seCruza) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Ese horario ya está reservado"
                );
            }
        }
    }

    private boolean horariosSeCruzan(String inicioA, String finA, String inicioB, String finB) {
        int aInicio = horaAMinutos(inicioA);
        int aFin = horaAMinutos(finA);
        int bInicio = horaAMinutos(inicioB);
        int bFin = horaAMinutos(finB);

        return aInicio < bFin && bInicio < aFin;
    }

    private int horaAMinutos(String hora) {
        String[] partes = hora.split(":");
        int horas = Integer.parseInt(partes[0]);
        int minutos = Integer.parseInt(partes[1]);
        return horas * 60 + minutos;
    }
}
