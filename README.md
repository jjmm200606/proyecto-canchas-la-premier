# Proyecto Canchas La Premier

Sistema web para administrar canchas y reservas de Cancha Sintetica La Premier.

## Estructura

- `canchas_web/`: paginas del frontend.
- `css/` y `js/`: estilos y logica del sitio publico.
- `backend_java/`: API REST con Spring Boot y MongoDB.

## Ejecutar backend

Desde `backend_java`:

```powershell
.\mvnw.cmd spring-boot:run
```

Por defecto usa MongoDB local:

```text
mongodb://localhost:27017/canchas_lapremier
```

Para usar MongoDB Atlas, configura la variable de entorno `MONGODB_URI` con tu cadena de conexion antes de iniciar la app.

## Ejecutar frontend

Abre `canchas_web/index.html` con Live Server o un servidor estatico. El frontend espera la API en:

```text
http://localhost:8081/api
```

## Usuario administrador

El backend crea un usuario administrador inicial:

```text
Correo: admin@lapremier.com
Clave: admin123
```
