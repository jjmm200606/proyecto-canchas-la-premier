const API_BASE = window.APP_CONFIG?.API_BASE || "http://localhost:8081/api";
const API_RESERVAS = `${API_BASE}/reservas`;
const API_CANCHAS = `${API_BASE}/canchas`;

let reservasCache = [];
let canchasCache = [];

function obtenerSesionActual() {
  return JSON.parse(localStorage.getItem("sesionActual")) || null;
}

function inicialesDe(nombre = "") {
  return (
    nombre
      .trim()
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte[0].toUpperCase())
      .join("") || "U"
  );
}

function actualizarBarraUsuario() {
  const sesion = obtenerSesionActual();

  const linkLogin = document.getElementById("linkLogin");
  const linkRegistro = document.getElementById("linkRegistro");
  const linkAdmin = document.getElementById("linkAdmin");
  const perfilUsuario = document.getElementById("perfilUsuario");
  const inicialUsuario = document.getElementById("inicialUsuario");
  const nombreUsuario = document.getElementById("nombreUsuario");
  const btnCerrarSesion = document.getElementById("btnCerrarSesion");

  if (!linkLogin || !linkRegistro || !linkAdmin || !perfilUsuario || !btnCerrarSesion) {
    return;
  }

  if (sesion) {
    linkLogin.classList.add("oculto");
    linkRegistro.classList.add("oculto");
    perfilUsuario.classList.remove("oculto");
    btnCerrarSesion.classList.remove("oculto");

    if (nombreUsuario) {
      nombreUsuario.textContent = sesion.nombre || "Usuario";
    }

    if (inicialUsuario) {
      inicialUsuario.textContent = inicialesDe(sesion.nombre);
    }

    linkAdmin.classList.remove("oculto");

  } else {
    linkLogin.classList.remove("oculto");
    linkRegistro.classList.remove("oculto");
    perfilUsuario.classList.add("oculto");
    btnCerrarSesion.classList.add("oculto");
    linkAdmin.classList.remove("oculto");
  }
}

function protegerAdmin() {
  const sesion = obtenerSesionActual();
  const accesoDenegado = document.getElementById("accesoDenegado");
  const panelAdmin = document.getElementById("panelAdmin");

  if (!accesoDenegado || !panelAdmin) return false;

  if (!sesion || sesion.rol !== "admin") {
    accesoDenegado.classList.remove("oculto");
    panelAdmin.classList.add("oculto");
    return false;
  }

  accesoDenegado.classList.add("oculto");
  panelAdmin.classList.remove("oculto");
  return true;
}

function cerrarSesion() {
  localStorage.removeItem("sesionActual");
  window.location.href = "login.html";
}

function formatearFechaRegistro(fechaRegistro) {
  if (!fechaRegistro) return "Sin registro";

  const fecha = new Date(fechaRegistro);

  if (isNaN(fecha.getTime())) return fechaRegistro;

  return fecha.toLocaleString("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatearHora12(hora = "") {
  if (!hora || !hora.includes(":")) return hora || "Sin hora";

  const partes = hora.split(":");
  const horas = Number(partes[0]);
  const minutos = Number(partes[1]);

  if (Number.isNaN(horas) || Number.isNaN(minutos)) return hora;

  const sufijo = horas >= 12 ? "PM" : "AM";
  let hora12 = horas % 12;

  if (hora12 === 0) {
    hora12 = 12;
  }

  return `${hora12}:${String(minutos).padStart(2, "0")} ${sufijo}`;
}

function formatearHorario(horaInicio, horaFin) {
  if (!horaInicio && !horaFin) return "Sin horario";

  if (horaInicio && horaFin) {
    return `${formatearHora12(horaInicio)} - ${formatearHora12(horaFin)}`;
  }

  return horaInicio || horaFin || "Sin horario";
}

function formatearPesos(valor) {
  const numero = Number(valor) || 0;
  return `$ ${numero.toLocaleString("es-CO")}`;
}

function normalizarEstado(estado = "") {
  const valor = estado.trim().toLowerCase();

  if (
    valor === "pendiente" ||
    valor === "reservada" ||
    valor === "reserva" ||
    valor === "activa"
  ) {
    return "Reservada";
  }

  if (valor === "confirmada" || valor === "confirmado") {
    return "Confirmada";
  }

  if (valor === "cancelada" || valor === "cancelado") {
    return "Cancelada";
  }

  if (valor === "completada" || valor === "completado" || valor === "finalizada") {
    return "Completada";
  }

  return estado || "Reservada";
}

function textoSeguro(valor = "") {
  return String(valor)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizarTexto(valor = "") {
  return String(valor)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

function tipoAmigable(tipo = "") {
  const texto = normalizarTexto(tipo);

  if (texto.includes("futbol 5") || texto.includes("futbol5")) {
    return "Fútbol 5 - Sintética";
  }

  if (texto.includes("futbol 11") || texto.includes("futbol11")) {
    return "Fútbol 11 - Sintética";
  }

  if (texto.includes("voley")) {
    return "Vóley Playa";
  }

  return tipo || "Sin tipo";
}

function esTipoVoley(tipo = "") {
  return normalizarTexto(tipo).includes("voley");
}

function obtenerPreciosCancha(cancha) {
  const tarifas = Array.isArray(cancha?.tarifas) ? cancha.tarifas : [];
  const diurna = tarifas.find((tarifa) => normalizarTexto(tarifa?.franja) === "diurna");
  const nocturna = tarifas.find((tarifa) => normalizarTexto(tarifa?.franja) === "nocturna");

  let precioAntes = Number(diurna?.precioHora) || 0;
  let precioDespues = Number(nocturna?.precioHora) || precioAntes;

  if (!precioAntes && !precioDespues) {
    const tipo = normalizarTexto(`${cancha?.tipo || ""} ${cancha?.nombre || ""}`);

    if (tipo.includes("futbol5")) {
      precioAntes = 50000;
      precioDespues = 70000;
    } else if (tipo.includes("futbol11")) {
      precioAntes = 120000;
      precioDespues = 140000;
    } else if (tipo.includes("voley")) {
      precioAntes = 50000;
      precioDespues = 50000;
    }
  }

  return { precioAntes, precioDespues };
}

function descripcionCancha(cancha) {
  const direccion = cancha?.ubicacion?.direccion || "Sin ubicación";
  const ciudad = cancha?.ubicacion?.ciudad || "Villavicencio";
  const departamento = cancha?.ubicacion?.departamento || "Meta";
  return `${direccion}, ${ciudad}, ${departamento}`;
}

function actualizarResumen(reservas) {
  const totalReservasAdmin = document.getElementById("totalReservasAdmin");
  const totalReservadasAdmin = document.getElementById("totalReservadasAdmin");
  const totalConfirmadasAdmin = document.getElementById("totalConfirmadasAdmin");
  const totalCanceladasAdmin = document.getElementById("totalCanceladasAdmin");

  const total = reservas.length;
  const reservadas = reservas.filter((r) => normalizarEstado(r.estado) === "Reservada").length;
  const confirmadas = reservas.filter((r) => normalizarEstado(r.estado) === "Confirmada").length;
  const canceladas = reservas.filter((r) => normalizarEstado(r.estado) === "Cancelada").length;

  if (totalReservasAdmin) totalReservasAdmin.textContent = total;
  if (totalReservadasAdmin) totalReservadasAdmin.textContent = reservadas;
  if (totalConfirmadasAdmin) totalConfirmadasAdmin.textContent = confirmadas;
  if (totalCanceladasAdmin) totalCanceladasAdmin.textContent = canceladas;
}

function llenarFiltroCanchas(canchas) {
  const filtroCanchaAdmin = document.getElementById("filtroCanchaAdmin");
  if (!filtroCanchaAdmin) return;

  const valorActual = filtroCanchaAdmin.value;

  const nombres = [...new Set(
    canchas
      .map((c) => c.nombre)
      .filter(Boolean)
  )].sort((a, b) => a.localeCompare(b));

  filtroCanchaAdmin.innerHTML = `<option value="">Todas las canchas</option>`;

  nombres.forEach((nombre) => {
    const option = document.createElement("option");
    option.value = nombre;
    option.textContent = nombre;
    filtroCanchaAdmin.appendChild(option);
  });

  filtroCanchaAdmin.value = nombres.includes(valorActual) ? valorActual : "";
}

function crearBotonesAcciones(reserva) {
  const estadoActual = normalizarEstado(reserva.estado);

  return `
    <div class="acciones-admin">
      <button type="button" onclick="cambiarEstadoReserva('${reserva.id}', 'Confirmada')" ${estadoActual === "Confirmada" ? "disabled" : ""}>
        Confirmar
      </button>
      <button type="button" onclick="cambiarEstadoReserva('${reserva.id}', 'Cancelada')" ${estadoActual === "Cancelada" ? "disabled" : ""}>
        Cancelar
      </button>
      <button type="button" class="btn-admin-eliminar" onclick="eliminarReserva('${reserva.id}')">
        Eliminar
      </button>
    </div>
  `;
}

function renderizarReservas(reservas) {
  const tablaReservasAdmin = document.getElementById("tablaReservasAdmin");
  if (!tablaReservasAdmin) return;

  tablaReservasAdmin.innerHTML = "";

  if (!reservas.length) {
    tablaReservasAdmin.innerHTML = `
      <tr>
        <td colspan="10" style="text-align:center;">No hay reservas para mostrar.</td>
      </tr>
    `;
    return;
  }

  reservas.forEach((reserva) => {
    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>${textoSeguro(reserva.nombreUsuario || "Sin nombre")}</td>
      <td>${textoSeguro(reserva.emailUsuario || "Sin correo")}</td>
      <td>${textoSeguro(reserva.nombreCancha || "Sin cancha")}</td>
      <td>${textoSeguro(reserva.fecha || "Sin fecha")}</td>
      <td>${textoSeguro(formatearHorario(reserva.horaInicio, reserva.horaFin))}</td>
      <td>${reserva.duracionHoras ?? 0} h</td>
      <td>${formatearPesos(reserva.precio ?? 0)}</td>
      <td>${textoSeguro(normalizarEstado(reserva.estado))}</td>
      <td>${textoSeguro(formatearFechaRegistro(reserva.fechaRegistro))}</td>
      <td>${crearBotonesAcciones(reserva)}</td>
    `;

    tablaReservasAdmin.appendChild(fila);
  });
}

function renderizarCardsCanchas(canchas) {
  const contenedor = document.getElementById("listaCanchasAdmin");
  if (!contenedor) return;

  contenedor.innerHTML = "";

  if (!canchas.length) {
    contenedor.innerHTML = `<p>No hay canchas para mostrar.</p>`;
    return;
  }

  canchas.forEach((cancha) => {
    const estadoActual = (cancha.estado || "").toLowerCase();
    const textoEstado = estadoActual === "habilitada" ? "Habilitada" : "Inhabilitada";
    const nuevoEstado = estadoActual === "habilitada" ? "inhabilitada" : "habilitada";
    const textoBoton = estadoActual === "habilitada" ? "Inhabilitar" : "Habilitar";
    const { precioAntes, precioDespues } = obtenerPreciosCancha(cancha);
    const imagen = Array.isArray(cancha.imagenes) && cancha.imagenes.length > 0 ? cancha.imagenes[0] : "";

    const card = document.createElement("div");
    card.className = "card-cancha-admin";

    card.innerHTML = `
      <div class="card-cancha-admin-info">
        ${imagen ? `<img class="card-cancha-admin-imagen" src="${imagen}" alt="${textoSeguro(cancha.nombre || "Cancha")}" />` : `<div class="card-cancha-admin-imagen card-cancha-admin-imagen-vacia">Sin imagen</div>`}
        <h3>${textoSeguro(cancha.nombre || "Sin nombre")}</h3>
        <p><strong>Tipo:</strong> ${textoSeguro(tipoAmigable(cancha.tipo))}</p>
        <p><strong>Estado:</strong> ${textoSeguro(textoEstado)}</p>
        <p><strong>Ubicación:</strong> ${textoSeguro(descripcionCancha(cancha))}</p>
        <p><strong>Precios:</strong> ${formatearPesos(precioAntes)} / ${formatearPesos(precioDespues)}</p>
      </div>
      <div class="card-cancha-admin-acciones">
        <button type="button" onclick="cambiarEstadoCancha('${cancha.id}', '${nuevoEstado}')">${textoBoton}</button>
        <button type="button" class="btn-card-secundario" onclick="editarCancha('${cancha.id}')">Editar</button>
        <button type="button" class="btn-card-eliminar" onclick="eliminarCancha('${cancha.id}')">Eliminar</button>
      </div>
    `;

    contenedor.appendChild(card);
  });
}

function renderizarTablaCanchas(canchas) {
  const tabla = document.getElementById("tablaCanchasAdmin");
  if (!tabla) return;

  if (!canchas.length) {
    tabla.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;">No hay canchas para mostrar.</td>
      </tr>
    `;
    return;
  }

  tabla.innerHTML = canchas.map((cancha) => {
    const { precioAntes, precioDespues } = obtenerPreciosCancha(cancha);
    const estadoActual = (cancha.estado || "").toLowerCase();
    const nuevoEstado = estadoActual === "habilitada" ? "inhabilitada" : "habilitada";
    const textoBoton = estadoActual === "habilitada" ? "Inhabilitar" : "Habilitar";

    return `
      <tr>
        <td>${textoSeguro(cancha.id || "-")}</td>
        <td>${textoSeguro(tipoAmigable(cancha.tipo))}</td>
        <td>${textoSeguro(cancha.nombre || "-")}</td>
        <td>${textoSeguro(descripcionCancha(cancha))}</td>
        <td>${Number(cancha.capacidad) || 0}</td>
        <td>${formatearPesos(precioAntes)} / ${formatearPesos(precioDespues)}</td>
        <td>
          <div class="acciones-admin">
            <button type="button" class="btn-tabla-admin" onclick="editarCancha('${cancha.id}')">Editar</button>
            <button type="button" class="btn-tabla-admin" onclick="cambiarEstadoCancha('${cancha.id}', '${nuevoEstado}')">${textoBoton}</button>
            <button type="button" class="btn-tabla-admin btn-eliminar-admin" onclick="eliminarCancha('${cancha.id}')">Eliminar</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function renderizarCanchasAdmin(canchas) {
  renderizarCardsCanchas(canchas);
  renderizarTablaCanchas(canchas);
}

function aplicarFiltros() {
  const filtroEstadoAdmin = document.getElementById("filtroEstadoAdmin");
  const filtroCanchaAdmin = document.getElementById("filtroCanchaAdmin");

  const estado = filtroEstadoAdmin?.value || "";
  const cancha = filtroCanchaAdmin?.value || "";

  let filtradas = [...reservasCache];

  if (estado) {
    filtradas = filtradas.filter((r) => normalizarEstado(r.estado) === estado);
  }

  if (cancha) {
    filtradas = filtradas.filter((r) => (r.nombreCancha || "") === cancha);
  }

  actualizarResumen(filtradas);
  renderizarReservas(filtradas);
}

async function cargarCanchasAdmin() {
  try {
    const respuesta = await fetch(`${API_CANCHAS}/admin`);

    if (!respuesta.ok) {
      throw new Error("No se pudieron cargar las canchas");
    }

    const canchas = await respuesta.json();
    canchasCache = Array.isArray(canchas) ? canchas : [];

    llenarFiltroCanchas(canchasCache);
    renderizarCanchasAdmin(canchasCache);
  } catch (error) {
    console.error("Error al cargar canchas:", error);
  }
}

async function cargarReservas() {
  const tablaReservasAdmin = document.getElementById("tablaReservasAdmin");

  if (tablaReservasAdmin) {
    tablaReservasAdmin.innerHTML = `
      <tr>
        <td colspan="10" style="text-align:center;">Cargando reservas...</td>
      </tr>
    `;
  }

  try {
    const respuesta = await fetch(API_RESERVAS);

    if (!respuesta.ok) {
      throw new Error("No se pudieron cargar las reservas");
    }

    const reservas = await respuesta.json();
    reservasCache = reservas;

    aplicarFiltros();
  } catch (error) {
    console.error(error);

    if (tablaReservasAdmin) {
      tablaReservasAdmin.innerHTML = `
        <tr>
          <td colspan="10" style="text-align:center;">Error al cargar reservas.</td>
        </tr>
      `;
    }
  }
}

async function cambiarEstadoReserva(id, nuevoEstado) {
  try {
    const respuesta = await fetch(`${API_RESERVAS}/${id}/estado`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ estado: nuevoEstado })
    });

    const texto = await respuesta.text();

    if (!respuesta.ok) {
      throw new Error(`Error ${respuesta.status}: ${texto}`);
    }

    await cargarReservas();
  } catch (error) {
    console.error("Error al cambiar estado:", error);
    alert("No se pudo cambiar el estado de la reserva.");
  }
}

async function cambiarEstadoCancha(id, estado) {
  try {
    const respuesta = await fetch(`${API_CANCHAS}/${id}/estado?estado=${encodeURIComponent(estado)}`, {
      method: "PUT"
    });

    const texto = await respuesta.text();

    if (!respuesta.ok) {
      throw new Error(`Error ${respuesta.status}: ${texto}`);
    }

    await cargarCanchasAdmin();
  } catch (error) {
    console.error("Error al cambiar estado de la cancha:", error);
    alert("No se pudo cambiar el estado de la cancha.");
  }
}

async function eliminarReserva(id) {
  const confirmado = confirm("¿Seguro que quieres eliminar esta reserva?");
  if (!confirmado) return;

  try {
    const respuesta = await fetch(`${API_RESERVAS}/${id}`, {
      method: "DELETE"
    });

    if (!respuesta.ok) {
      throw new Error("No se pudo eliminar la reserva");
    }

    await cargarReservas();
  } catch (error) {
    console.error(error);
    alert("No se pudo eliminar la reserva.");
  }
}

async function eliminarTodasLasReservas() {
  if (!reservasCache.length) {
    alert("No hay reservas para eliminar.");
    return;
  }

  const confirmado = confirm("¿Seguro que quieres eliminar todas las reservas visibles?");
  if (!confirmado) return;

  try {
    for (const reserva of reservasCache) {
      await fetch(`${API_RESERVAS}/${reserva.id}`, {
        method: "DELETE"
      });
    }

    await cargarReservas();
  } catch (error) {
    console.error(error);
    alert("Ocurrió un error eliminando las reservas.");
  }
}

function seleccionarTipoEnFormulario(tipo = "") {
  const select = document.getElementById("nuevoTipoCancha");
  const campoOtro = document.getElementById("campoTipoCanchaOtro");
  const inputOtro = document.getElementById("nuevoTipoCanchaOtro");
  if (!select || !campoOtro || !inputOtro) return;

  const opciones = ["Fútbol 5 - Sintética", "Fútbol 11 - Sintética", "Vóley Playa"];
  const tipoLimpio = tipoAmigable(tipo);

  if (opciones.includes(tipoLimpio)) {
    select.value = tipoLimpio;
    campoOtro.classList.add("oculto");
    inputOtro.required = false;
    inputOtro.value = "";
  } else {
    select.value = "Otro";
    campoOtro.classList.remove("oculto");
    inputOtro.required = true;
    inputOtro.value = tipo || "";
  }
}

function actualizarPreviewImagen(imagen = "") {
  const preview = document.getElementById("previewImagenCancha");
  if (!preview) return;

  if (!imagen) {
    preview.classList.add("oculto");
    preview.innerHTML = "";
    return;
  }

  preview.classList.remove("oculto");
  preview.innerHTML = `
    <p>Imagen actual</p>
    <img src="${imagen}" alt="Imagen de cancha" />
  `;
}

function limpiarMensajeCancha() {
  const mensaje = document.getElementById("mensajeAgregarCancha");
  if (!mensaje) return;
  mensaje.className = "mensaje-form";
  mensaje.textContent = "";
}

function mostrarMensajeCancha(tipo, texto) {
  const mensaje = document.getElementById("mensajeAgregarCancha");
  if (!mensaje) return;
  mensaje.className = tipo === "ok" ? "mensaje-ok" : "mensaje-error";
  mensaje.textContent = texto;
}

function resetearFormularioCancha() {
  document.getElementById("formAgregarCancha")?.reset();

  const canchaEditandoId = document.getElementById("canchaEditandoId");
  if (canchaEditandoId) canchaEditandoId.value = "";

  const tituloFormulario = document.getElementById("tituloFormularioCancha");
  if (tituloFormulario) tituloFormulario.textContent = "Agregar cancha";

  const btnGuardar = document.getElementById("btnGuardarCancha");
  if (btnGuardar) btnGuardar.textContent = "Agregar cancha";

  const btnCancelar = document.getElementById("btnCancelarEdicionCancha");
  if (btnCancelar) btnCancelar.classList.add("oculto");

  const campoTipoOtro = document.getElementById("campoTipoCanchaOtro");
  if (campoTipoOtro) campoTipoOtro.classList.add("oculto");

  const inputTipoOtro = document.getElementById("nuevoTipoCanchaOtro");
  if (inputTipoOtro) {
    inputTipoOtro.required = false;
    inputTipoOtro.value = "";
  }

  const inputImagen = document.getElementById("nuevaImagenCancha");
  if (inputImagen) inputImagen.value = "";

  actualizarPreviewImagen("");
  limpiarMensajeCancha();
}

function leerArchivoComoBase64(archivo) {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve(String(lector.result || ""));
    lector.onerror = () => reject(new Error("No se pudo leer la imagen"));
    lector.readAsDataURL(archivo);
  });
}

async function construirPayloadCancha() {
  const canchaEditandoId = document.getElementById("canchaEditandoId")?.value || "";
  const canchaActual = canchasCache.find((item) => String(item.id) === String(canchaEditandoId));

  const tipoSeleccionado = document.getElementById("nuevoTipoCancha")?.value || "";
  const tipoOtro = document.getElementById("nuevoTipoCanchaOtro")?.value.trim() || "";
  const tipo = tipoSeleccionado === "Otro" ? tipoOtro : tipoSeleccionado;
  const nombre = document.getElementById("nuevoNombreCancha")?.value.trim() || "";
  const direccion = document.getElementById("nuevaUbicacionCancha")?.value.trim() || "";
  const capacidad = Number(document.getElementById("nuevaCapacidadCancha")?.value || 0);
  const precioAntes = Number(document.getElementById("nuevoPrecioAntesCancha")?.value || 0);
  const precioDespues = Number(document.getElementById("nuevoPrecioDespuesCancha")?.value || 0);
  const archivoImagen = document.getElementById("nuevaImagenCancha")?.files?.[0] || null;

  if (!tipo) {
    throw new Error("Debes indicar el tipo de cancha.");
  }

  if (!nombre || !direccion || !capacidad || !precioAntes || !precioDespues) {
    throw new Error("Completa todos los campos de la cancha.");
  }

  let imagenes = Array.isArray(canchaActual?.imagenes) ? [...canchaActual.imagenes] : [];

  if (archivoImagen) {
    const imagenBase64 = await leerArchivoComoBase64(archivoImagen);
    imagenes = imagenBase64 ? [imagenBase64] : [];
  }

  return {
    id: canchaActual?.id,
    nombre,
    tipo,
    descripcion: canchaActual?.descripcion || `Cancha de ${tipo}.`,
    capacidad,
    ubicacion: {
      direccion,
      ciudad: canchaActual?.ubicacion?.ciudad || "Villavicencio",
      departamento: canchaActual?.ubicacion?.departamento || "Meta"
    },
    contacto: {
      telefono: canchaActual?.contacto?.telefono || "3124342025",
      whatsapp: canchaActual?.contacto?.whatsapp || "3124342025"
    },
    horarioAtencion: {
      apertura: canchaActual?.horarioAtencion?.apertura || "08:00",
      cierre: canchaActual?.horarioAtencion?.cierre || "22:00"
    },
    estado: canchaActual?.estado || "habilitada",
    imagenes,
    tarifas: [
      {
        franja: "diurna",
        horaInicio: "08:00",
        horaFin: "17:59",
        precioHora: precioAntes
      },
      {
        franja: "nocturna",
        horaInicio: "18:00",
        horaFin: "22:00",
        precioHora: precioDespues
      }
    ],
    fechaCreacion: canchaActual?.fechaCreacion || new Date().toISOString()
  };
}

async function guardarCancha(evento) {
  evento.preventDefault();

  try {
    const canchaEditandoId = document.getElementById("canchaEditandoId")?.value || "";
    const payload = await construirPayloadCancha();
    const esEdicion = Boolean(canchaEditandoId);

    const respuesta = await fetch(esEdicion ? `${API_CANCHAS}/${canchaEditandoId}` : API_CANCHAS, {
      method: esEdicion ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const texto = await respuesta.text();

    if (!respuesta.ok) {
      throw new Error(texto || "No se pudo guardar la cancha.");
    }

    resetearFormularioCancha();
    mostrarMensajeCancha("ok", esEdicion ? "Cancha actualizada correctamente." : "Cancha agregada correctamente.");
    await cargarCanchasAdmin();
  } catch (error) {
    console.error(error);
    mostrarMensajeCancha("error", error.message || "No se pudo guardar la cancha.");
  }
}

function editarCancha(id) {
  const cancha = canchasCache.find((item) => String(item.id) === String(id));
  if (!cancha) {
    alert("No se encontró la cancha.");
    return;
  }

  const { precioAntes, precioDespues } = obtenerPreciosCancha(cancha);

  document.getElementById("canchaEditandoId").value = cancha.id || "";
  document.getElementById("nuevoNombreCancha").value = cancha.nombre || "";
  document.getElementById("nuevaUbicacionCancha").value = cancha.ubicacion?.direccion || "";
  document.getElementById("nuevaCapacidadCancha").value = cancha.capacidad || "";
  document.getElementById("nuevoPrecioAntesCancha").value = precioAntes || "";
  document.getElementById("nuevoPrecioDespuesCancha").value = precioDespues || "";
  document.getElementById("nuevaImagenCancha").value = "";

  seleccionarTipoEnFormulario(cancha.tipo || "");
  actualizarPreviewImagen(Array.isArray(cancha.imagenes) && cancha.imagenes.length ? cancha.imagenes[0] : "");

  document.getElementById("tituloFormularioCancha").textContent = "Editar cancha";
  document.getElementById("btnGuardarCancha").textContent = "Guardar cambios";
  document.getElementById("btnCancelarEdicionCancha").classList.remove("oculto");

  limpiarMensajeCancha();
  document.getElementById("tituloFormularioCancha")?.scrollIntoView({ behavior: "smooth", block: "center" });
}

async function eliminarCancha(id) {
  const confirmado = confirm("¿Seguro que quieres eliminar esta cancha?");
  if (!confirmado) return;

  try {
    const respuesta = await fetch(`${API_CANCHAS}/${id}`, {
      method: "DELETE"
    });

    const texto = await respuesta.text();

    if (!respuesta.ok) {
      throw new Error(texto || "No se pudo eliminar la cancha.");
    }

    if ((document.getElementById("canchaEditandoId")?.value || "") === String(id)) {
      resetearFormularioCancha();
    }

    await cargarCanchasAdmin();
    mostrarMensajeCancha("ok", "Cancha eliminada correctamente.");
  } catch (error) {
    console.error(error);
    mostrarMensajeCancha("error", error.message || "No se pudo eliminar la cancha.");
  }
}

function manejarCambioTipoCancha() {
  const tipoCanchaSelect = document.getElementById("nuevoTipoCancha");
  const campoTipoCanchaOtro = document.getElementById("campoTipoCanchaOtro");
  const inputOtro = document.getElementById("nuevoTipoCanchaOtro");
  if (!tipoCanchaSelect || !campoTipoCanchaOtro || !inputOtro) return;

  if (tipoCanchaSelect.value === "Otro") {
    campoTipoCanchaOtro.classList.remove("oculto");
    inputOtro.required = true;
  } else {
    campoTipoCanchaOtro.classList.add("oculto");
    inputOtro.required = false;
    inputOtro.value = "";
  }
}

function configurarEventos() {
  const btnCerrarSesion = document.getElementById("btnCerrarSesion");
  const filtroEstadoAdmin = document.getElementById("filtroEstadoAdmin");
  const filtroCanchaAdmin = document.getElementById("filtroCanchaAdmin");
  const btnLimpiarReservasAdmin = document.getElementById("btnLimpiarReservasAdmin");
  const formAgregarCancha = document.getElementById("formAgregarCancha");
  const tipoCanchaSelect = document.getElementById("nuevoTipoCancha");
  const btnCancelarEdicionCancha = document.getElementById("btnCancelarEdicionCancha");
  const inputImagenCancha = document.getElementById("nuevaImagenCancha");

  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener("click", cerrarSesion);
  }

  if (filtroEstadoAdmin) {
    filtroEstadoAdmin.addEventListener("change", aplicarFiltros);
  }

  if (filtroCanchaAdmin) {
    filtroCanchaAdmin.addEventListener("change", aplicarFiltros);
  }

  if (btnLimpiarReservasAdmin) {
    btnLimpiarReservasAdmin.addEventListener("click", eliminarTodasLasReservas);
  }

  if (formAgregarCancha) {
    formAgregarCancha.addEventListener("submit", guardarCancha);
  }

  if (tipoCanchaSelect) {
    tipoCanchaSelect.addEventListener("change", manejarCambioTipoCancha);
  }

  if (btnCancelarEdicionCancha) {
    btnCancelarEdicionCancha.addEventListener("click", resetearFormularioCancha);
  }

  if (inputImagenCancha) {
    inputImagenCancha.addEventListener("change", async (event) => {
      const archivo = event.target.files?.[0];
      if (!archivo) {
        const canchaEditandoId = document.getElementById("canchaEditandoId")?.value || "";
        const canchaActual = canchasCache.find((item) => String(item.id) === String(canchaEditandoId));
        actualizarPreviewImagen(Array.isArray(canchaActual?.imagenes) && canchaActual.imagenes.length ? canchaActual.imagenes[0] : "");
        return;
      }

      try {
        const imagen = await leerArchivoComoBase64(archivo);
        actualizarPreviewImagen(imagen);
      } catch (error) {
        console.error(error);
        mostrarMensajeCancha("error", "No se pudo cargar la imagen.");
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  actualizarBarraUsuario();
  configurarEventos();
  resetearFormularioCancha();

  const permitido = protegerAdmin();
  if (!permitido) return;

  await cargarCanchasAdmin();
  await cargarReservas();
});
