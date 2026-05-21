
package com.lapremier.canchas.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Document(collection = "canchas")
public class Cancha {

    @Id
    public String id;

    public String nombre;
    public String tipo;
    public String descripcion;
    public Integer capacidad;
    public Ubicacion ubicacion;
    public Contacto contacto;
    public HorarioAtencion horarioAtencion;
    public String estado;
    public List<String> imagenes = new ArrayList<>();
    public List<Tarifa> tarifas = new ArrayList<>();
    public Date fechaCreacion;

    public Cancha() {
    }

    public static class Ubicacion {
        public String direccion;
        public String ciudad;
        public String departamento;

        public Ubicacion() {
        }
    }

    public static class Contacto {
        public String telefono;
        public String whatsapp;

        public Contacto() {
        }
    }

    public static class HorarioAtencion {
        public String apertura;
        public String cierre;

        public HorarioAtencion() {
        }
    }

    public static class Tarifa {
        public String franja;
        public String horaInicio;
        public String horaFin;
        public Integer precioHora;

        public Tarifa() {
        }
    }
}