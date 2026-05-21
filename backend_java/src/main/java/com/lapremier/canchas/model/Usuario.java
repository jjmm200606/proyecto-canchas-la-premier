package com.lapremier.canchas.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "usuarios")
public class Usuario {

    @Id
    public String id;

    public String nombre;

    @Indexed(unique = true)
    public String email;

    public String password;
    public String rol;
    public String telefono;
    public Boolean activo;
    public Date fechaRegistro;

    public Usuario() {
    }
}