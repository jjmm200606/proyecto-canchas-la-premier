package com.lapremier.canchas.config;

import com.lapremier.canchas.model.Cancha;
import com.lapremier.canchas.model.Usuario;
import com.lapremier.canchas.repository.CanchaRepository;
import com.lapremier.canchas.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final CanchaRepository canchaRepository;
    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public DataInitializer(CanchaRepository canchaRepository, UsuarioRepository usuarioRepository) {
        this.canchaRepository = canchaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public void run(String... args) {
        crearUsuarios();
        crearCanchas();
    }

    private void crearUsuarios() {
        if (!usuarioRepository.existsByEmail("admin@lapremier.com")) {
            Usuario admin = new Usuario();
            admin.nombre = "Administrador";
            admin.email = "admin@lapremier.com";
            admin.password = passwordEncoder.encode("admin123");
            admin.rol = "admin";
            admin.telefono = "3124342025";
            admin.activo = true;
            admin.fechaRegistro = new Date();
            usuarioRepository.save(admin);
        }

        if (!usuarioRepository.existsByEmail("cliente@correo.com")) {
            Usuario cliente = new Usuario();
            cliente.nombre = "Cliente Prueba";
            cliente.email = "cliente@correo.com";
            cliente.password = passwordEncoder.encode("123456");
            cliente.rol = "cliente";
            cliente.telefono = "3001234567";
            cliente.activo = true;
            cliente.fechaRegistro = new Date();
            usuarioRepository.save(cliente);
        }
    }

    private void crearCanchas() {
        if (canchaRepository.count() > 0) {
            return;
        }

        canchaRepository.saveAll(List.of(
                crearCanchaFutbol5(),
                crearCanchaFutbol11(),
                crearCanchaVoley()
        ));
    }

    private Cancha crearCanchaFutbol5() {
        Cancha cancha = new Cancha();
        cancha.nombre = "Fútbol 5 - Sintética";
        cancha.tipo = "futbol5";
        cancha.descripcion = "Cancha sintética para partidos rápidos y entrenamientos.";
        cancha.capacidad = 10;
        cancha.ubicacion = crearUbicacion();
        cancha.contacto = crearContacto();
        cancha.horarioAtencion = crearHorarioAtencion();
        cancha.estado = "habilitada";
        cancha.fechaCreacion = new Date();
        cancha.tarifas = List.of(
                crearTarifa("diurna", "08:00", "17:59", 50000),
                crearTarifa("nocturna", "18:00", "22:00", 70000)
        );
        return cancha;
    }

    private Cancha crearCanchaFutbol11() {
        Cancha cancha = new Cancha();
        cancha.nombre = "Fútbol 11 - Sintética";
        cancha.tipo = "futbol11";
        cancha.descripcion = "Cancha sintética amplia para torneos y partidos completos.";
        cancha.capacidad = 22;
        cancha.ubicacion = crearUbicacion();
        cancha.contacto = crearContacto();
        cancha.horarioAtencion = crearHorarioAtencion();
        cancha.estado = "habilitada";
        cancha.fechaCreacion = new Date();
        cancha.tarifas = List.of(
                crearTarifa("diurna", "08:00", "17:59", 120000),
                crearTarifa("nocturna", "18:00", "22:00", 140000)
        );
        return cancha;
    }

    private Cancha crearCanchaVoley() {
        Cancha cancha = new Cancha();
        cancha.nombre = "Vóley Playa";
        cancha.tipo = "voley";
        cancha.descripcion = "Cancha de arena ideal para recreación y competencias.";
        cancha.capacidad = 12;
        cancha.ubicacion = crearUbicacion();
        cancha.contacto = crearContacto();
        cancha.horarioAtencion = crearHorarioAtencion();
        cancha.estado = "habilitada";
        cancha.fechaCreacion = new Date();
        cancha.tarifas = List.of(
                crearTarifa("diurna", "08:00", "17:59", 50000),
                crearTarifa("nocturna", "18:00", "22:00", 50000)
        );
        return cancha;
    }

    private Cancha.Ubicacion crearUbicacion() {
        Cancha.Ubicacion ubicacion = new Cancha.Ubicacion();
        ubicacion.direccion = "Cra. 1 #18-18";
        ubicacion.ciudad = "Villavicencio";
        ubicacion.departamento = "Meta";
        return ubicacion;
    }

    private Cancha.Contacto crearContacto() {
        Cancha.Contacto contacto = new Cancha.Contacto();
        contacto.telefono = "3124342025";
        contacto.whatsapp = "3124342025";
        return contacto;
    }

    private Cancha.HorarioAtencion crearHorarioAtencion() {
        Cancha.HorarioAtencion horario = new Cancha.HorarioAtencion();
        horario.apertura = "08:00";
        horario.cierre = "22:00";
        return horario;
    }

    private Cancha.Tarifa crearTarifa(String franja, String horaInicio, String horaFin, Integer precioHora) {
        Cancha.Tarifa tarifa = new Cancha.Tarifa();
        tarifa.franja = franja;
        tarifa.horaInicio = horaInicio;
        tarifa.horaFin = horaFin;
        tarifa.precioHora = precioHora;
        return tarifa;
    }
}
