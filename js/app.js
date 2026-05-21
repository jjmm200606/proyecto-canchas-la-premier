document.addEventListener("DOMContentLoaded", async () => {
  await inicializarSistema();
});

const API_BASE = window.APP_CONFIG?.API_BASE || "http://localhost:8081/api";

async function inicializarSistema() {
  await sincronizarCanchasDesdeBackend();
  conectarEventosBase();
  configurarFechaMinima();
  renderizarCanchas();
  actualizarBarraUsuario();
  renderizarPanelReservas();
  validarVistaAdmin();
}

function conectarEventosBase() {
  const btnCerrarSesion = document.getElementById("btnCerrarSesion");
  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener("click", cerrarSesionUsuario);
  }

  const formLogin = document.getElementById("formLogin");
  if (formLogin) {
    formLogin.addEventListener("submit", iniciarSesion);
  }

  const formRegistro = document.getElementById("formRegistro");
  if (formRegistro) {
    formRegistro.addEventListener("submit", registrarUsuario);
  }

  const formAgregarCancha = document.getElementById("formAgregarCancha");
  if (formAgregarCancha) {
    formAgregarCancha.addEventListener("submit", agregarCanchaAdmin);
  }

  const duracionSelect = document.getElementById("duracionReserva");
  const campoDuracionExtra = document.getElementById("campoDuracionExtra");
  const otraDuracionInput = document.getElementById("otraDuracion");

  if (duracionSelect && campoDuracionExtra && otraDuracionInput) {
    duracionSelect.addEventListener("change", () => {
      if (duracionSelect.value === "otro") {
        campoDuracionExtra.classList.remove("oculto");
        otraDuracionInput.required = true;
      } else {
        campoDuracionExtra.classList.add("oculto");
        otraDuracionInput.required = false;
      }
    });
  }

  const tipoCanchaSelect = document.getElementById("nuevoTipoCancha");
  const campoTipoCanchaOtro = document.getElementById("campoTipoCanchaOtro");
  if (tipoCanchaSelect && campoTipoCanchaOtro) {
    tipoCanchaSelect.addEventListener("change", () => {
      const inputOtro = document.getElementById("nuevoTipoCanchaOtro");
      if (tipoCanchaSelect.value === "Otro") {
        campoTipoCanchaOtro.classList.remove("oculto");
        if (inputOtro) inputOtro.required = true;
      } else {
        campoTipoCanchaOtro.classList.add("oculto");
        if (inputOtro) inputOtro.required = false;
      }
    });
  }

  const overlayReserva = document.getElementById("overlayReserva");
  if (overlayReserva) {
    overlayReserva.addEventListener("click", (e) => {
      if (e.target === overlayReserva) {
        cerrarModalReserva();
      }
    });
  }

  const btnHamburger = document.getElementById("btnHamburger");
  const menuMovil = document.getElementById("menuMovil");
  if (btnHamburger && menuMovil) {
    btnHamburger.addEventListener("click", () => {
      menuMovil.classList.toggle("oculto");
    });
  }

  document.addEventListener("click", (e) => {
    if (
      menuMovil &&
      !e.target.closest("#menuMovil") &&
      !e.target.closest("#btnHamburger")
    ) {
      menuMovil.classList.add("oculto");
    }
  });

  const btnLimpiarReservasAdmin = document.getElementById("btnLimpiarReservasAdmin");
  if (btnLimpiarReservasAdmin) {
    btnLimpiarReservasAdmin.addEventListener("click", limpiarTodasReservasAdmin);
  }

  const filtroEstadoAdmin = document.getElementById("filtroEstadoAdmin");
  if (filtroEstadoAdmin) {
    filtroEstadoAdmin.addEventListener("change", renderizarReservasAdmin);
  }

  const filtroCanchaAdmin = document.getElementById("filtroCanchaAdmin");
  if (filtroCanchaAdmin) {
    filtroCanchaAdmin.addEventListener("change", renderizarReservasAdmin);
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      cerrarModalReserva();
    }
  });
}

function inicializarStorage() {
  if (!localStorage.getItem("usuarios")) {
    const usuariosBase = [
      {
        id: "admin-local",
        nombre: "Administrador",
        email: "admin@lapremier.com",
        password: "admin123",
        rol: "admin"
      }
    ];
    localStorage.setItem("usuarios", JSON.stringify(usuariosBase));
  }
}

function obtenerUsuarios() {
  return JSON.parse(localStorage.getItem("usuarios")) || [];
}

function guardarUsuarios(usuarios) {
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
}

async function obtenerReservasBackend() {
  try {
    const respuesta = await fetch(`${API_BASE}/reservas`);
    if (!respuesta.ok) {
      throw new Error("No se pudieron obtener las reservas");
    }
    return await respuesta.json();
  } catch (error) {
    console.error("Error obteniendo reservas:", error);
    return [];
  }
}

async function buscarReservasBackend(canchaId, fecha) {
  try {
    const respuesta = await fetch(
      `${API_BASE}/reservas/buscar?canchaId=${encodeURIComponent(canchaId)}&fecha=${encodeURIComponent(fecha)}`
    );
    if (!respuesta.ok) {
      throw new Error("No se pudieron buscar las reservas");
    }
    return await respuesta.json();
  } catch (error) {
    console.error("Error buscando reservas:", error);
    return [];
  }
}

async function crearReservaBackend(reserva) {
  const respuesta = await fetch(`${API_BASE}/reservas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(reserva)
  });

  if (!respuesta.ok) {
    const texto = await respuesta.text();
    throw new Error(texto || "No se pudo guardar la reserva");
  }

  return await respuesta.json();
}

function obtenerCanchas() {
  return JSON.parse(localStorage.getItem("canchas")) || [];
}

function guardarCanchas(canchas) {
  localStorage.setItem("canchas", JSON.stringify(canchas));
}

function obtenerCanchasBase() {
  return [
    {
      id: "futbol-5-base",
      tipo: "Fútbol 5 - Sintética",
      nombre: "Fútbol 5 - Sintética",
      ubicacion: "Cra. 1 #18-18, Villavicencio, Meta",
      capacidad: 10,
      precioAntes: 50000,
      precioDespues: 70000,
      descripcion: "Cancha sintética para partidos rápidos y entrenamientos.",
      imagen: "/canchas_web/img/futbol11.png",
      habilitada: true
    },
    {
      id: "futbol-11-base",
      tipo: "Fútbol 11 - Sintética",
      nombre: "Fútbol 11 - Sintética",
      ubicacion: "Cra. 1 #18-18, Villavicencio, Meta",
      capacidad: 22,
      precioAntes: 120000,
      precioDespues: 140000,
      descripcion: "Cancha sintética amplia para torneos y partidos completos.",
      imagen: "/canchas_web/img/futbol11.png",
      habilitada: true
    },
    {
      id: "voley-base",
      tipo: "Vóley Playa",
      nombre: "Vóley Playa",
      ubicacion: "Cra. 1 #18-18, Villavicencio, Meta",
      capacidad: 12,
      precioAntes: 50000,
      precioDespues: 50000,
      descripcion: "Cancha de arena ideal para recreación y competencias.",
      imagen: "/canchas_web/img/futbol11.png",
      habilitada: true
    }
  ];
}

function asegurarCanchasBase() {
  if (obtenerCanchas().length === 0) {
    guardarCanchas(obtenerCanchasBase());
  }
}

async function sincronizarCanchasDesdeBackend() {
  try {
    const respuesta = await fetch(`${API_BASE}/canchas`);
    if (!respuesta.ok) {
      throw new Error("No se pudieron cargar las canchas desde el backend");
    }

    const canchasBackend = await respuesta.json();
    const canchasMapeadas = canchasBackend.map(mapearCanchaBackendAFrontend);

    guardarCanchas(canchasMapeadas);
  } catch (error) {
    console.error("Error sincronizando canchas:", error);
    asegurarCanchasBase();
  }
}

function normalizarTextoCancha(valor = "") {
  return String(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function esTipoVoleyCancha(tipo = "") {
  return normalizarTextoCancha(tipo).includes("voley");
}

function mapearCanchaBackendAFrontend(cancha) {
  const textoBase = normalizarTextoCancha(`${cancha.tipo || ""} ${cancha.nombre || ""}`);
  const tarifas = Array.isArray(cancha.tarifas) ? cancha.tarifas : [];
  const tarifaDiurna = tarifas.find((tarifa) => normalizarTextoCancha(tarifa?.franja) === "diurna");
  const tarifaNocturna = tarifas.find((tarifa) => normalizarTextoCancha(tarifa?.franja) === "nocturna");

  let precioAntes = Number(tarifaDiurna?.precioHora) || 0;
  let precioDespues = Number(tarifaNocturna?.precioHora) || precioAntes;

  if (!precioAntes && !precioDespues) {
    if (textoBase.includes("futbol5")) {
      precioAntes = 50000;
      precioDespues = 70000;
    } else if (textoBase.includes("futbol11")) {
      precioAntes = 120000;
      precioDespues = 140000;
    } else if (textoBase.includes("voleyplaya") || textoBase.includes("voley")) {
      precioAntes = 50000;
      precioDespues = 50000;
    }
  }

  return {
    id: cancha.id,
    tipo: cancha.tipo || "",
    nombre: cancha.nombre || "",
    ubicacion: cancha.ubicacion?.direccion
      ? `${cancha.ubicacion.direccion}, ${cancha.ubicacion.ciudad || "Villavicencio"}, ${cancha.ubicacion.departamento || "Meta"}`
      : "Villavicencio, Meta",
    capacidad: cancha.capacidad || 0,
    precioAntes,
    precioDespues,
    descripcion: cancha.descripcion || "",
    imagen: Array.isArray(cancha.imagenes) && cancha.imagenes.length > 0 ? cancha.imagenes[0] : "",
    habilitada: ["habilitada", "disponible"].includes(String(cancha.estado || "").toLowerCase())
  };
}

function renderizarCanchas() {
  const grid = document.getElementById("canchasGrid");
  const selectCancha = document.getElementById("canchaReserva");

  if (!grid) return;

  const canchas = obtenerCanchas().filter((cancha) => cancha.habilitada !== false);

  grid.innerHTML = canchas
    .map((cancha) => {
      const precioAntes = cancha.precioAntes ? "$ " + cancha.precioAntes.toLocaleString("es-CO") : "-";
      const precioDespues = cancha.precioDespues ? "$ " + cancha.precioDespues.toLocaleString("es-CO") : "-";
      const preciosHtml = esTipoVoleyCancha(cancha.tipo)
        ? `
            <div class="precios">
              <p>Precio</p>
              <p>${precioAntes} / hora</p>
            </div>
          `
        : `
            <div class="precios">
              <p>Antes de 6:00 pm</p>
              <p>${precioAntes} / hora</p>
              <p>Después de 6:00 pm</p>
              <p>${precioDespues} / hora</p>
            </div>
          `;
      const imagenStyle = cancha.imagen
        ? `background-image: url('${cancha.imagen}'); background-size: cover; background-position: center;`
        : "";

      return `
        <article class="cancha-card">
          <div class="cancha-imagen" style="${imagenStyle}"></div>
          <div class="cancha-info">
            <div>
              <h3>${cancha.nombre}</h3>
              <div class="cancha-meta">
                <div class="cancha-texto">
                  <p>Ubicación: ${cancha.ubicacion}</p>
                  <p>Tel/WhatsApp: 3124342025</p>
                  <p>Capacidad: ${cancha.capacidad} jugadores</p>
                  <p>${cancha.descripcion}</p>
                </div>
                ${preciosHtml}
              </div>
            </div>
            <div class="botones-cancha">
              <button class="boton-amarillo" onclick="abrirModalReserva('${cancha.id}')">Ver | Reservar</button>
              <a class="boton-verde" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cancha.ubicacion)}" target="_blank">Cómo llegar</a>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  if (selectCancha) {
    selectCancha.innerHTML = canchas
      .map((cancha) => `<option value="${cancha.id}">${cancha.nombre}</option>`)
      .join("");
  }
}

function obtenerCanchaPorId(canchaId) {
  return obtenerCanchas().find((c) => String(c.id) === String(canchaId));
}

function obtenerPrecio(canchaId, duracion, horario) {
  const canchaInfo = obtenerCanchaPorId(canchaId);

  if (canchaInfo) {
    const precioAntes = Number(canchaInfo.precioAntes) || 0;
    const precioDespues = Number(canchaInfo.precioDespues) || precioAntes;

    let tarifaPorHora = precioAntes;
    if (horario) {
      const horaInicio = parseInt(horario.split(" - ")[0].split(":")[0], 10);

      if (esTipoVoleyCancha(canchaInfo.tipo)) {
        tarifaPorHora = precioAntes;
      } else {
        tarifaPorHora = horaInicio >= 18 ? precioDespues : precioAntes;
      }
    }

    return tarifaPorHora * duracion;
  }

  return 0;
}

function obtenerSesionActual() {
  return JSON.parse(localStorage.getItem("sesionActual")) || null;
}

function guardarSesionActual(usuario) {
  localStorage.setItem("sesionActual", JSON.stringify(usuario));
}

function actualizarBarraUsuario() {
  const sesion = obtenerSesionActual();

  const linkLogin = document.getElementById("linkLogin");
  const linkRegistro = document.getElementById("linkRegistro");
  const linkAdmin = document.getElementById("linkAdmin");
  const perfilUsuario = document.getElementById("perfilUsuario");
  const nombreUsuario = document.getElementById("nombreUsuario");
  const inicialUsuario = document.getElementById("inicialUsuario");
  const btnCerrarSesion = document.getElementById("btnCerrarSesion");

  if (sesion) {
    if (linkLogin) linkLogin.classList.add("oculto");
    if (linkRegistro) linkRegistro.classList.add("oculto");
    if (perfilUsuario) perfilUsuario.classList.remove("oculto");
    if (btnCerrarSesion) btnCerrarSesion.classList.remove("oculto");

   if (linkAdmin) {
  linkAdmin.classList.remove("oculto");
}

    if (nombreUsuario) {
      nombreUsuario.textContent = sesion.nombre || "Usuario";
    }

    if (inicialUsuario) {
      inicialUsuario.textContent = sesion.nombre
        ? sesion.nombre.charAt(0).toUpperCase()
        : "U";
    }
  } else {
    if (linkLogin) linkLogin.classList.remove("oculto");
    if (linkRegistro) linkRegistro.classList.remove("oculto");
    if (perfilUsuario) perfilUsuario.classList.add("oculto");
    if (btnCerrarSesion) btnCerrarSesion.classList.add("oculto");
   if (linkAdmin) linkAdmin.classList.remove("oculto");
  }
}

function cerrarSesionUsuario() {
  localStorage.removeItem("sesionActual");
  window.location.href = "/canchas_web/index.html";
}

async function iniciarSesion(e) {
  e.preventDefault();

  const email = document.getElementById("loginEmail")?.value.trim().toLowerCase();
  const password = document.getElementById("loginPassword")?.value.trim();
  const mensaje = document.getElementById("mensajeLogin");

  if (!email || !password) {
    if (mensaje) {
      mensaje.style.color = "#b42318";
      mensaje.textContent = "Completa correo y contraseña.";
    }
    return;
  }

  try {
    const respuesta = await fetch(`${API_BASE}/usuarios/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await respuesta.json();

    if (!respuesta.ok || !data.ok) {
      if (mensaje) {
        mensaje.style.color = "#b42318";
        mensaje.textContent = data.mensaje || "No se pudo iniciar sesión.";
      }
      return;
    }

    guardarSesionActual(data.usuario);

    if (mensaje) {
      mensaje.style.color = "#166534";
      mensaje.textContent = "Inicio de sesión exitoso.";
    }

    setTimeout(() => {
      window.location.href = "/canchas_web/admin.html";
    }, 900);

  } catch (error) {
    console.error("Error en login:", error);
    if (mensaje) {
      mensaje.style.color = "#b42318";
      mensaje.textContent = "No se pudo conectar con el backend.";
    }
  }
}

function registrarUsuario(e) {
  e.preventDefault();

  const nombre = document.getElementById("registroNombre")?.value.trim();
  const email = document.getElementById("registroEmail")?.value.trim().toLowerCase();
  const password = document.getElementById("registroPassword")?.value.trim();
  const password2 = document.getElementById("registroPassword2")?.value.trim();
  const mensaje = document.getElementById("mensajeRegistro");

  if (!nombre || !email || !password || !password2) {
    if (mensaje) {
      mensaje.style.color = "#b42318";
      mensaje.textContent = "Completa todos los campos.";
    }
    return;
  }

  if (password !== password2) {
    if (mensaje) {
      mensaje.style.color = "#b42318";
      mensaje.textContent = "Las contraseñas no coinciden.";
    }
    return;
  }

  if (mensaje) {
    mensaje.style.color = "#b42318";
    mensaje.textContent = "Registro deshabilitado. Solo el administrador puede iniciar sesión.";
  }
}

function configurarFechaMinima() {
  const fechaInput = document.getElementById("fechaReserva");
  if (!fechaInput) return;

  const hoy = new Date().toISOString().split("T")[0];
  fechaInput.min = hoy;

  if (!fechaInput.value) {
    fechaInput.value = hoy;
  }
}

function formatearPesos(valor) {
  return "$ " + Number(valor || 0).toLocaleString("es-CO");
}

function formatearFecha(fechaISO) {
  if (!fechaISO) return "";
  const partes = fechaISO.split("-");
  if (partes.length !== 3) return fechaISO;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function esEmailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function esCelularValido(celular) {
  return /^\d{7,15}$/.test(celular);
}

function crearBloquesHorarios(duracion) {
  const bloques = [];
  const horaInicio = 8;
  const horaFin = 24;

  for (let hora = horaInicio; hora + duracion <= horaFin; hora++) {
    const inicio = String(hora).padStart(2, "0") + ":00";
    const fin = String(hora + duracion).padStart(2, "0") + ":00";
    bloques.push(inicio + " - " + fin);
  }

  return bloques;
}

function formatearHoraAMPM(hora24) {
  const [horaStr, minutosStr] = hora24.split(":");
  let hora = parseInt(horaStr, 10);
  const minutos = parseInt(minutosStr, 10);
  const suffix = hora >= 12 ? "PM" : "AM";
  hora = hora % 12;
  if (hora === 0) hora = 12;
  return `${hora}:${String(minutos).padStart(2, "0")} ${suffix}`;
}

function formatearHorarioAMPM(horario24) {
  if (!horario24 || !horario24.includes(" - ")) return horario24 || "";
  const [inicio, fin] = horario24.split(" - ");
  return `${formatearHoraAMPM(inicio)} - ${formatearHoraAMPM(fin)}`;
}

function formatearHorarioDesdeCampos(horaInicio, horaFin) {
  if (!horaInicio && !horaFin) return "";
  if (horaInicio && horaFin) {
    return `${formatearHoraAMPM(horaInicio)} - ${formatearHoraAMPM(horaFin)}`;
  }
  return horaInicio || horaFin || "";
}

function horaAMinutos(horaTexto) {
  const [hora, minutos] = horaTexto.split(":").map(Number);
  return hora * 60 + minutos;
}

function extraerRango(horario) {
  const [inicio, fin] = horario.split(" - ");
  return {
    inicio: horaAMinutos(inicio),
    fin: horaAMinutos(fin)
  };
}

function horariosSeCruzan(horarioA, horarioB) {
  const a = extraerRango(horarioA);
  const b = extraerRango(horarioB);
  return a.inicio < b.fin && b.inicio < a.fin;
}

function abrirModalReserva(canchaId) {
  const overlay = document.getElementById("overlayReserva");
  const selectCancha = document.getElementById("canchaReserva");
  const mensajeReserva = document.getElementById("mensajeReserva");
  const contenedorHorarios = document.getElementById("contenedorHorarios");
  const textoAyuda = document.getElementById("textoAyudaReserva");
  const panelColumna = document.getElementById("panelReservasColumna");

  if (overlay) {
    overlay.classList.remove("oculto");
  }

  if (panelColumna) {
    panelColumna.classList.add("oculto");
  }

  if (selectCancha && canchaId) {
    selectCancha.value = String(canchaId);
  }

  if (mensajeReserva) {
    mensajeReserva.innerHTML = "";
  }

  if (contenedorHorarios) {
    contenedorHorarios.innerHTML = "";
  }

  if (textoAyuda) {
    textoAyuda.textContent = "Selecciona fecha y consulta.";
  }

  configurarFechaMinima();
  renderizarPanelReservas();
}

function cerrarModalReserva() {
  const overlay = document.getElementById("overlayReserva");
  if (overlay) {
    overlay.classList.add("oculto");
  }
}

async function mostrarHorariosDisponibles() {
  const canchaSelect = document.getElementById("canchaReserva");
  const fechaInput = document.getElementById("fechaReserva");
  const duracionSelect = document.getElementById("duracionReserva");
  const contenedor = document.getElementById("contenedorHorarios");
  const textoAyuda = document.getElementById("textoAyudaReserva");
  const mensaje = document.getElementById("mensajeReserva");

  if (!canchaSelect || !fechaInput || !duracionSelect || !contenedor) return;

  const canchaId = canchaSelect.value;
  const canchaInfo = obtenerCanchaPorId(canchaId);
  const fecha = fechaInput.value;
  let duracion = 0;

  if (duracionSelect.value === "otro") {
    const otraDuracion = parseInt(document.getElementById("otraDuracion")?.value, 10);
    duracion = Number.isInteger(otraDuracion) && otraDuracion >= 4 ? otraDuracion : 4;
  } else {
    duracion = parseInt(duracionSelect.value, 10);
  }

  if (mensaje) {
    mensaje.innerHTML = "";
  }

  if (!canchaInfo) {
    if (textoAyuda) {
      textoAyuda.textContent = "Selecciona una cancha válida.";
    }
    return;
  }

  if (!fecha) {
    if (textoAyuda) {
      textoAyuda.textContent = "Debes seleccionar una fecha.";
    }
    return;
  }

  if (!duracion || duracion < 1) {
    if (textoAyuda) {
      textoAyuda.textContent = "Selecciona una duración válida.";
    }
    return;
  }

  const horarios = crearBloquesHorarios(duracion);
  const reservas = await buscarReservasBackend(canchaId, fecha);

  contenedor.innerHTML = "";

  horarios.forEach((horario) => {
    const precio = obtenerPrecio(canchaId, duracion, horario);

    const yaReservado = reservas.some((reserva) => {
      const horarioReserva = `${reserva.horaInicio} - ${reserva.horaFin}`;
      return (
        String(reserva.canchaId) === String(canchaId) &&
        reserva.fecha === fecha &&
        horariosSeCruzan(horarioReserva, horario) &&
        String(reserva.estado || "").toLowerCase() !== "cancelada"
      );
    });

    if (yaReservado) {
      return;
    }

    const tarjeta = document.createElement("div");
    tarjeta.className = "tarjeta-horario";

    const horarioAMPM = formatearHorarioAMPM(horario);
    tarjeta.innerHTML = `
      <h3>${horarioAMPM}</h3>
      <p>Duración: ${duracion} hora(s) • Total:<br>${formatearPesos(precio)}</p>
      <button class="btn-horario">Elegir</button>
    `;

    const boton = tarjeta.querySelector("button");
    boton.addEventListener("click", () => {
      reservarHorario(canchaId, fecha, duracion, horario);
    });

    contenedor.appendChild(tarjeta);
  });

  if (textoAyuda) {
    textoAyuda.textContent = "Selecciona un horario para guardar la reserva.";
  }
}

async function reservarHorario(canchaId, fecha, duracion, horario) {
  const mensaje = document.getElementById("mensajeReserva");
  const nombre = document.getElementById("reservaNombre")?.value.trim();
  const email = document.getElementById("reservaEmail")?.value.trim().toLowerCase();
  const celular = document.getElementById("reservaCelular")?.value.trim();
  const canchaInfo = obtenerCanchaPorId(canchaId);

  if (!nombre) {
    if (mensaje) {
      mensaje.innerHTML = `
        <div class="mensaje-error">
          Ingresa tu nombre para reservar.
        </div>
      `;
    }
    return;
  }

  if (!email || !esEmailValido(email)) {
    if (mensaje) {
      mensaje.innerHTML = `
        <div class="mensaje-error">
          Ingresa un correo válido.
        </div>
      `;
    }
    return;
  }

  if (!celular || !esCelularValido(celular)) {
    if (mensaje) {
      mensaje.innerHTML = `
        <div class="mensaje-error">
          Ingresa un celular válido (7 a 15 dígitos).
        </div>
      `;
    }
    return;
  }

  if (!canchaInfo) {
    if (mensaje) {
      mensaje.innerHTML = `
        <div class="mensaje-error">
          La cancha seleccionada no es válida.
        </div>
      `;
    }
    return;
  }

  const reservas = await buscarReservasBackend(canchaId, fecha);

  const yaExiste = reservas.some((reserva) => {
    const horarioReserva = `${reserva.horaInicio} - ${reserva.horaFin}`;
    return (
      String(reserva.canchaId) === String(canchaId) &&
      reserva.fecha === fecha &&
      horariosSeCruzan(horarioReserva, horario) &&
      String(reserva.estado || "").toLowerCase() !== "cancelada"
    );
  });

  if (yaExiste) {
    if (mensaje) {
      mensaje.innerHTML = `
        <div class="mensaje-error">
          Ese horario ya está reservado.
        </div>
      `;
    }
    mostrarHorariosDisponibles();
    renderizarPanelReservas();
    return;
  }

  const [horaInicio, horaFin] = horario.split(" - ");
  const sesion = obtenerSesionActual();

  const nuevaReserva = {
    usuarioId: sesion?.id || email,
    nombreUsuario: nombre,
    emailUsuario: email,
    canchaId: String(canchaInfo.id),
    nombreCancha: canchaInfo.nombre,
    fecha: fecha,
    horaInicio: horaInicio,
    horaFin: horaFin,
    duracionHoras: duracion,
    precio: obtenerPrecio(canchaId, duracion, horario),
    estado: "ACTIVA",
    observaciones: `Celular: ${celular}`
  };

  let reservaGuardada;
  try {
    reservaGuardada = await crearReservaBackend(nuevaReserva);
  } catch (error) {
    console.error("Error guardando reserva:", error);
    if (mensaje) {
      mensaje.innerHTML = `
        <div class="mensaje-error">
          No se pudo guardar la reserva.<br>
          <small>${error.message}</small>
        </div>
      `;
    }
    return;
  }

  if (mensaje) {
    mensaje.innerHTML = `
      <div class="mensaje-ok">
        ✅ Apartada
        <small>Cancha: ${canchaInfo.nombre}</small>
        <small>Fecha: ${formatearFecha(fecha)}</small>
        <small>Horario: ${formatearHorarioAMPM(horario)}</small>
        <small>Total: ${formatearPesos(reservaGuardada.precio || nuevaReserva.precio)}</small>
      </div>
    `;
  }

  const panelColumna = document.getElementById("panelReservasColumna");
  if (panelColumna) {
    panelColumna.classList.remove("oculto");
    setTimeout(() => {
      panelColumna.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
  }

  await mostrarHorariosDisponibles();
  await renderizarPanelReservas();
  await renderizarResumenAdmin();
  await renderizarReservasAdmin();
}

async function renderizarPanelReservas() {
  const panel = document.getElementById("panelReservas");
  if (!panel) return;

  const reservas = await obtenerReservasBackend();

  if (reservas.length === 0) {
    panel.innerHTML = `
      <div class="reserva-vacia">
        <p>Aún no tienes reservas.</p>
      </div>
    `;
    return;
  }

  const ultimaReserva = reservas[0];

  panel.innerHTML = `
    <div class="reserva-exitosa">
      <div class="reserva-header">
        <span class="estado-icon">✓</span>
        <span class="estado-texto">Reserva exitosa</span>
      </div>
      <div class="reserva-detalles">
        <div class="detalle-item">
          <span class="detalle-label">⚽ Cancha:</span>
          <span>${ultimaReserva.nombreCancha || "-"}</span>
        </div>
        <div class="detalle-item">
          <span class="detalle-label">📅 Fecha:</span>
          <span>${formatearFecha(ultimaReserva.fecha)}</span>
        </div>
        <div class="detalle-item">
          <span class="detalle-label">🕐 Horario:</span>
          <span>${formatearHorarioDesdeCampos(ultimaReserva.horaInicio, ultimaReserva.horaFin)}</span>
        </div>
        <div class="detalle-item">
          <span class="detalle-label">⏱️ Duración:</span>
          <span>${ultimaReserva.duracionHoras || 1} hora(s)</span>
        </div>
        <div class="detalle-item">
          <span class="detalle-label">💰 Total:</span>
          <span>${formatearPesos(ultimaReserva.precio)}</span>
        </div>
      </div>
      <div class="reserva-footer">
        <p class="contacto-info">
          📞 Si deseas cancelar esta reserva, comunícate al:<br>
          <strong>Tel/WhatsApp: 3124342025</strong>
        </p>
      </div>
    </div>
  `;
}

function eliminarReserva() {
  alert("Eliminar reservas desde el panel aún requiere endpoint backend de borrado.");
}

/* ADMINISTRADOR */

function agregarCanchaAdmin(e) {
  e.preventDefault();

  const tipoSeleccionado = document.getElementById("nuevoTipoCancha")?.value;
  const tipoOtro = document.getElementById("nuevoTipoCanchaOtro")?.value.trim();
  const nombre = document.getElementById("nuevoNombreCancha")?.value.trim();
  const ubicacion = document.getElementById("nuevaUbicacionCancha")?.value.trim();
  const capacidad = parseInt(document.getElementById("nuevaCapacidadCancha")?.value, 10);
  const precioAntes = parseInt(document.getElementById("nuevoPrecioAntesCancha")?.value, 10);
  const precioDespues = parseInt(document.getElementById("nuevoPrecioDespuesCancha")?.value, 10);
  const mensaje = document.getElementById("mensajeAgregarCancha");

  let tipo = tipoSeleccionado;
  if (tipoSeleccionado === "Otro") {
    tipo = tipoOtro;
  }

  if (tipoSeleccionado === "Otro" && !tipoOtro) {
    if (mensaje) {
      mensaje.className = "mensaje-error";
      mensaje.textContent = "Ingresa el tipo de cancha cuando selecciones 'Otro'.";
    }
    return;
  }

  if (!tipo || !nombre || !ubicacion || !capacidad || !precioAntes || !precioDespues) {
    if (mensaje) {
      mensaje.className = "mensaje-error";
      mensaje.textContent = "Completa todos los campos del formulario.";
    }
    return;
  }

  const canchas = obtenerCanchas();
  const nuevoId = String(Date.now());

  canchas.push({
    id: nuevoId,
    tipo,
    nombre,
    ubicacion,
    capacidad,
    precioAntes,
    precioDespues,
    descripcion: `Cancha de ${tipo}`,
    habilitada: true
  });

  guardarCanchas(canchas);
  renderizarCanchas();
  renderizarCanchasAdmin();

  if (mensaje) {
    mensaje.className = "mensaje-ok";
    mensaje.textContent = "Cancha agregada correctamente.";
  }

  document.getElementById("formAgregarCancha")?.reset();
}

function validarVistaAdmin() {
  const adminPage = document.getElementById("adminPage");
  if (!adminPage) return;

  const sesion = obtenerSesionActual();
  const accesoDenegado = document.getElementById("accesoDenegado");
  const panelAdmin = document.getElementById("panelAdmin");

  if (!sesion || sesion.rol !== "admin") {
    if (accesoDenegado) accesoDenegado.classList.remove("oculto");
    if (panelAdmin) panelAdmin.classList.add("oculto");
    return;
  }

  if (accesoDenegado) accesoDenegado.classList.add("oculto");
  if (panelAdmin) panelAdmin.classList.remove("oculto");

  renderizarResumenAdmin();
  renderizarReservasAdmin();
  renderizarCanchasAdmin();
}

async function renderizarResumenAdmin() {
  const totalReservasAdmin = document.getElementById("totalReservasAdmin");
  const totalReservadasAdmin = document.getElementById("totalReservadasAdmin");
  const totalConfirmadasAdmin = document.getElementById("totalConfirmadasAdmin");
  const totalCanceladasAdmin = document.getElementById("totalCanceladasAdmin");

  if (!totalReservasAdmin) return;

  const reservas = await obtenerReservasBackend();

  totalReservasAdmin.textContent = reservas.length;
  totalReservadasAdmin.textContent = reservas.filter(
    (r) => String(r.estado || "").toLowerCase() === "reservada" || String(r.estado || "").toLowerCase() === "activa"
  ).length;
  totalConfirmadasAdmin.textContent = reservas.filter(
    (r) => String(r.estado || "").toLowerCase() === "confirmada"
  ).length;
  totalCanceladasAdmin.textContent = reservas.filter(
    (r) => String(r.estado || "").toLowerCase() === "cancelada"
  ).length;
}

async function renderizarReservasAdmin() {
  const tabla = document.getElementById("tablaReservasAdmin");
  if (!tabla) return;

  const filtroEstado = document.getElementById("filtroEstadoAdmin")?.value || "";
  const filtroCancha = document.getElementById("filtroCanchaAdmin")?.value || "";

  let reservas = await obtenerReservasBackend();

  if (filtroEstado) {
    reservas = reservas.filter((r) => String(r.estado || "").toLowerCase() === filtroEstado.toLowerCase());
  }

  if (filtroCancha) {
    reservas = reservas.filter((r) => r.nombreCancha === filtroCancha);
  }

  if (reservas.length === 0) {
    tabla.innerHTML = `
      <tr>
        <td colspan="10">No hay reservas para mostrar.</td>
      </tr>
    `;
    return;
  }

  tabla.innerHTML = reservas
    .map((reserva) => {
      return `
        <tr>
          <td>${reserva.nombreUsuario || "-"}</td>
          <td>${reserva.emailUsuario || "-"}</td>
          <td>${reserva.nombreCancha || "-"}</td>
          <td>${formatearFecha(reserva.fecha)}</td>
          <td>${formatearHorarioDesdeCampos(reserva.horaInicio, reserva.horaFin)}</td>
          <td>${reserva.duracionHoras || 1} hora(s)</td>
          <td>${formatearPesos(reserva.precio)}</td>
          <td>${reserva.estado || "-"}</td>
          <td>${reserva.fechaRegistro ? new Date(reserva.fechaRegistro).toLocaleString("es-CO") : "-"}</td>
          <td>
            <button class="btn-tabla-admin btn-eliminar-admin" onclick="alert('Para cambiar o eliminar reservas desde este archivo usa admin.js.')">
              Gestionar
            </button>
          </td>
        </tr>
      `;
    })
    .join("");
}

function renderizarCanchasAdmin() {
  const tabla = document.getElementById("tablaCanchasAdmin");
  if (!tabla) return;

  const canchas = obtenerCanchas();

  if (canchas.length === 0) {
    tabla.innerHTML = `
      <tr>
        <td colspan="8">No hay canchas para mostrar.</td>
      </tr>
    `;
    return;
  }

  tabla.innerHTML = canchas
    .map((cancha) => {
      const precioAntes = cancha.precioAntes ? "$ " + cancha.precioAntes.toLocaleString("es-CO") : "-";
      const precioDespues = cancha.precioDespues ? "$ " + cancha.precioDespues.toLocaleString("es-CO") : "-";

      return `
        <tr>
          <td>${cancha.id}</td>
          <td>${cancha.tipo}</td>
          <td>${cancha.nombre}</td>
          <td>${cancha.ubicacion}</td>
          <td>${cancha.capacidad}</td>
          <td>${precioAntes} / ${precioDespues}</td>
          <td>${cancha.habilitada === false ? "Inhabilitada" : "Habilitada"}</td>
          <td>
            <button class="btn-tabla-admin" onclick="toggleCanchaAdmin('${cancha.id}')">
              ${cancha.habilitada === false ? "Habilitar" : "Inhabilitar"}
            </button>
            <button class="btn-tabla-admin btn-eliminar-admin" onclick="eliminarCanchaAdmin('${cancha.id}')">
              Eliminar
            </button>
          </td>
        </tr>
      `;
    })
    .join("");
}

function toggleCanchaAdmin(id) {
  const canchas = obtenerCanchas().map((c) => {
    if (String(c.id) === String(id)) {
      return {
        ...c,
        habilitada: c.habilitada === false ? true : false
      };
    }
    return c;
  });

  guardarCanchas(canchas);
  renderizarCanchas();
  renderizarCanchasAdmin();
}

function eliminarCanchaAdmin(id) {
  const confirmar = confirm("¿Deseas eliminar esta cancha?");
  if (!confirmar) return;

  const canchas = obtenerCanchas();
  const canchasActualizadas = canchas.filter((c) => String(c.id) !== String(id));
  guardarCanchas(canchasActualizadas);

  renderizarCanchas();
  renderizarCanchasAdmin();
}

function actualizarEstadoReservaAdmin() {
  alert("Actualizar estado desde admin se maneja en admin.js.");
}

function eliminarReservaAdmin() {
  alert("Eliminar reservas desde admin se maneja en admin.js.");
}

function limpiarTodasReservasAdmin() {
  alert("Limpiar reservas desde admin se maneja en admin.js.");
}
