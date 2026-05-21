package com.lapremier.canchas.repository;

import com.lapremier.canchas.model.Reserva;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ReservaRepository extends MongoRepository<Reserva, String> {

    List<Reserva> findAllByOrderByFechaRegistroDesc();

    List<Reserva> findByCanchaIdAndFecha(String canchaId, String fecha);

    List<Reserva> findByCanchaIdAndFechaAndEstado(String canchaId, String fecha, String estado);

    boolean existsByCanchaIdAndFechaAndHoraInicioAndEstado(
            String canchaId,
            String fecha,
            String horaInicio,
            String estado
    );
}