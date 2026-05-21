package com.lapremier.canchas.service;

import com.lapremier.canchas.model.Reserva;
import com.lapremier.canchas.repository.ReservaRepository;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class ReservaService {

    private final ReservaRepository reservaRepository;

    public ReservaService(ReservaRepository reservaRepository) {
        this.reservaRepository = reservaRepository;
    }

    public List<Reserva> listar() {
        return reservaRepository.findAllByOrderByFechaRegistroDesc();
    }

    public Reserva obtenerPorId(String id) {
        return reservaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));
    }

    public List<Reserva> obtenerPorCanchaYFecha(String canchaId, String fecha) {
        return reservaRepository.findByCanchaIdAndFechaAndEstado(canchaId, fecha, "ACTIVA");
    }

    public Reserva guardar(Reserva reserva) {
        if (reserva.getUsuarioId() == null || reserva.getUsuarioId().isBlank()) {
            throw new RuntimeException("El usuarioId es obligatorio");
        }

        if (reserva.getNombreUsuario() == null || reserva.getNombreUsuario().isBlank()) {
            throw new RuntimeException("El nombre del usuario es obligatorio");
        }

        if (reserva.getEmailUsuario() == null || reserva.getEmailUsuario().isBlank()) {
            throw new RuntimeException("El email del usuario es obligatorio");
        }

        if (reserva.getCanchaId() == null || reserva.getCanchaId().isBlank()) {
            throw new RuntimeException("El canchaId es obligatorio");
        }

        if (reserva.getNombreCancha() == null || reserva.getNombreCancha().isBlank()) {
            throw new RuntimeException("El nombre de la cancha es obligatorio");
        }

        if (reserva.getFecha() == null || reserva.getFecha().isBlank()) {
            throw new RuntimeException("La fecha es obligatoria");
        }

        if (reserva.getHoraInicio() == null || reserva.getHoraInicio().isBlank()) {
            throw new RuntimeException("La hora de inicio es obligatoria");
        }

        if (reserva.getHoraFin() == null || reserva.getHoraFin().isBlank()) {
            throw new RuntimeException("La hora de fin es obligatoria");
        }

        boolean yaExiste = reservaRepository.existsByCanchaIdAndFechaAndHoraInicioAndEstado(
                reserva.getCanchaId(),
                reserva.getFecha(),
                reserva.getHoraInicio(),
                "ACTIVA"
        );

        if (yaExiste) {
            throw new RuntimeException("Ese horario ya está reservado para esa cancha");
        }

        if (reserva.getEstado() == null || reserva.getEstado().isBlank()) {
            reserva.setEstado("ACTIVA");
        }

        if (reserva.getFechaRegistro() == null) {
            reserva.setFechaRegistro(new Date());
        }

        return reservaRepository.save(reserva);
    }

    public Reserva actualizar(String id, Reserva datosActualizados) {
        Reserva reserva = obtenerPorId(id);

        reserva.setUsuarioId(datosActualizados.getUsuarioId());
        reserva.setNombreUsuario(datosActualizados.getNombreUsuario());
        reserva.setEmailUsuario(datosActualizados.getEmailUsuario());
        reserva.setCanchaId(datosActualizados.getCanchaId());
        reserva.setNombreCancha(datosActualizados.getNombreCancha());
        reserva.setFecha(datosActualizados.getFecha());
        reserva.setHoraInicio(datosActualizados.getHoraInicio());
        reserva.setHoraFin(datosActualizados.getHoraFin());
        reserva.setDuracionHoras(datosActualizados.getDuracionHoras());
        reserva.setPrecio(datosActualizados.getPrecio());
        reserva.setObservaciones(datosActualizados.getObservaciones());

        if (datosActualizados.getEstado() != null && !datosActualizados.getEstado().isBlank()) {
            reserva.setEstado(datosActualizados.getEstado());
        }

        return reservaRepository.save(reserva);
    }

    public Reserva actualizarEstado(String id, String nuevoEstado) {
        Reserva reserva = obtenerPorId(id);
        reserva.setEstado(nuevoEstado);
        return reservaRepository.save(reserva);
    }

    public void eliminar(String id) {
        Reserva reserva = obtenerPorId(id);
        reservaRepository.delete(reserva);
    }
}