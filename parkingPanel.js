// ======================================================================
// EXAMEN DWEC — parkingPanel.js
// Toda la lógica del gestor de parking
// ======================================================================

(() => {
  // ======================================================================
  // CONSTANTES
  // ======================================================================
  const PLAZAS_ALUMNOS = 400;
  const PLAZAS_PROFES = 200;
  const PLAZAS_MOTOS = 100;

  const KEY_OPERARIO = "parking_operario";
  const KEY_VEHICULOS = "parking_vehiculos";

  // ======================================================================
  // ESTADO
  // ======================================================================
  let operario = null;
  let vehiculos = [];
  let imagenTemporal = null; // para la imagen del vehículo

  // ======================================================================
  // AUXILIARES
  // ======================================================================
  const $ = (id) => document.getElementById(id);

  function ahora() {
    const d = new Date();
    return `${d.toLocaleDateString()} - ${d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  // ======================================================================
  // MODELO VEHÍCULO
  // ======================================================================
  class Vehiculo {
    constructor(matricula, propietario, tipo, imagen = null) {
      this.matricula = matricula;
      this.propietario = propietario;
      this.tipo = tipo;
      this.imagen = imagen; // base64 (opcional)

      this.estado = false;
      this.total = 0;

      this.historial = [];

      this.ultimaEntrada = null;
      this.ultimaSalida = null;
      this.ultimaEntradaMs = null;
    }
  }

  // ======================================================================
  // LOCALSTORAGE
  // ======================================================================
  function cargarEstado() {
    const op = localStorage.getItem(KEY_OPERARIO);
    if (op) operario = op;

    try {
      const ve = localStorage.getItem(KEY_VEHICULOS);
      if (ve) vehiculos = JSON.parse(ve);
    } catch (e) {
      console.warn("JSON corrupto, reseteando...");
      vehiculos = [];
      localStorage.removeItem(KEY_VEHICULOS);
    }
  }

  function guardarVehiculos() {
    localStorage.setItem(KEY_VEHICULOS, JSON.stringify(vehiculos));
  }

  function establecerOperario(nombre) {
    operario = nombre;
    localStorage.setItem(KEY_OPERARIO, nombre);

    const nodo = $("saludo");
    if (nodo) nodo.textContent = operario;
  }

  // ======================================================================
  // VISTAS
  // ======================================================================
  function ocultarTodasLasVistas() {
    document
      .querySelectorAll(".view")
      .forEach((v) => (v.style.display = "none"));
  }

  function mostrarVista(id) {
    ocultarTodasLasVistas();
    const panel = $(id);
    if (panel) panel.style.display = "block";
  }

  // ======================================================================
  // PLAZAS
  // ======================================================================
  function plazasOcupadas() {
    const occ = { alumnos: 0, profesores: 0, motos: 0 };

    vehiculos.forEach((v) => {
      if (v.estado) {
        if (v.tipo === "Moto") occ.motos++;
        else if (v.propietario === "Alumno") occ.alumnos++;
        else if (v.propietario === "Profesor") occ.profesores++;
      }
    });

    return occ;
  }

  function plazasLibres() {
    const occ = plazasOcupadas();
    return {
      alumnos: PLAZAS_ALUMNOS - occ.alumnos,
      profesores: PLAZAS_PROFES - occ.profesores,
      motos: PLAZAS_MOTOS - occ.motos,
    };
  }

  function renderContadores() {
    const occ = plazasOcupadas();
    const libres = plazasLibres();
    const total = occ.alumnos + occ.profesores + occ.motos;

    const cab = $("contadorPlazas");
    if (cab) {
      cab.textContent =
        `Dentro: ${total} | ` +
        `Alumnos: ${occ.alumnos}/${PLAZAS_ALUMNOS} | ` +
        `Profesores: ${occ.profesores}/${PLAZAS_PROFES} | ` +
        `Motos: ${occ.motos}/${PLAZAS_MOTOS}`;
    }

    const info = $("plazasInfo");
    if (info) {
      info.innerHTML = `
        <p>Alumnos → dentro: ${occ.alumnos}, libres: ${libres.alumnos}</p>
        <p>Profesores → dentro: ${occ.profesores}, libres: ${libres.profesores}</p>
        <p>Motos → dentro: ${occ.motos}, libres: ${libres.motos}</p>
      `;
    }
  }

  // ======================================================================
  // MENSAJES
  // ======================================================================
  function mostrarMensaje(texto, error = false) {
    const m = $("mensajes");
    if (!m) return;

    m.textContent = texto;
    m.style.color = error ? "crimson" : "white";

    setTimeout(() => {
      if (m.textContent === texto) m.textContent = "";
    }, 4000);
  }

  // ======================================================================
  // REGISTRO
  // ======================================================================
  function registrarVehiculo(e) {
    e.preventDefault();
    console.log("SUBMIT OK");

    const propietario = $("propietario").value;
    const tipo = $("tipo").value;
    let matricula = $("matricula").value.trim().toUpperCase();

    if (!matricula) return mostrarMensaje("La matrícula es obligatoria", true);

    if (vehiculos.some((v) => v.matricula === matricula))
      return mostrarMensaje("La matrícula ya existe", true);

    const nuevo = new Vehiculo(matricula, propietario, tipo, imagenTemporal);
    vehiculos.push(nuevo);

    guardarVehiculos();
    renderContadores();

    // limpiar imagen temporal y preview
    imagenTemporal = null;
    const preview = $("preview-img");
    if (preview) {
      preview.src = "";
      preview.style.display = "none";
    }


    mostrarMensaje(`Vehículo ${matricula} registrado`);
    
    // limpiar campos del formulario
    $("formRegistro").reset();
    mostrarVista("home");
  }

  // ======================================================================
  // ENTRADA
  // ======================================================================
  function registrarEntrada(e) {
    e.preventDefault();

    const mat = $("matEntrada").value.trim().toUpperCase();
    if (!mat) return mostrarMensaje("Introduce matrícula", true);

    const v = vehiculos.find((x) => x.matricula === mat);
    if (!v) return mostrarMensaje("No existe el vehículo", true);

    if (v.estado) return mostrarMensaje("Ya está dentro", true);

    const libres = plazasLibres();

    if (v.tipo === "Moto" && libres.motos <= 0)
      return mostrarMensaje("Sin plazas para motos", true);

    if (v.propietario === "Alumno" && libres.alumnos <= 0)
      return mostrarMensaje("Sin plazas para alumnos", true);

    if (v.propietario === "Profesor" && libres.profesores <= 0)
      return mostrarMensaje("Sin plazas para profesores", true);

    v.estado = true;
    v.ultimaEntrada = ahora();
    v.ultimaEntradaMs = Date.now();

    v.historial.push({ tipo: "entrada", fecha: v.ultimaEntrada, operario });

    guardarVehiculos();
    renderContadores();
    mostrarMensaje("Entrada registrada");
    mostrarVista("home");
  }

  // ======================================================================
  // SALIDA
  // ======================================================================
  function registrarSalida(e) {
    e.preventDefault();

    const mat = $("matSalida").value.trim().toUpperCase();
    if (!mat) return mostrarMensaje("Introduce matrícula", true);

    const v = vehiculos.find((x) => x.matricula === mat);
    if (!v) return mostrarMensaje("No existe el vehículo", true);

    if (!v.estado) return mostrarMensaje("El vehículo no está dentro", true);

    let minutos = 0;
    if (v.ultimaEntradaMs) {
      minutos = Math.round((Date.now() - v.ultimaEntradaMs) / 60000);
    }

    v.total += minutos;
    v.estado = false;
    v.ultimaSalida = ahora();
    v.ultimaEntradaMs = null;

    v.historial.push({
      tipo: "salida",
      fecha: v.ultimaSalida,
      minutos,
      operario,
    });

    guardarVehiculos();
    renderContadores();
    mostrarMensaje(`Salida registrada. Minutos: ${minutos}`);

    mostrarVista("home");
  }

  // ======================================================================
  // LISTADO
  // ======================================================================
  function verListado() {
    const cont = $("tablaListado");
    if (!cont) return;

    if (vehiculos.length === 0) {
      cont.innerHTML = "<p>No hay vehículos registrados.</p>";
      return;
    }

    let html = `
      <table>
        <thead>
          <tr>
            <th>Matrícula</th>
            <th>Propietario</th>
            <th>Tipo</th>
            <th>Dentro</th>
            <th>Entrada</th>
            <th>Salida</th>
            <th>Minutos</th>
          </tr>
        </thead>
        <tbody>
    `;

    vehiculos.forEach((v) => {
      html += `
        <tr>
          <td>${v.matricula}</td>
          <td>${v.propietario}</td>
          <td>${v.tipo}</td>
          <td>${v.estado ? "Sí" : "No"}</td>
          <td>${v.ultimaEntrada || "-"}</td>
          <td>${v.ultimaSalida || "-"}</td>
          <td>${v.total}</td>
        </tr>`;
    });

    cont.innerHTML = html + "</tbody></table>";
  }

  // ======================================================================
  // DRAG & DROP
  // ======================================================================
  /*function activarDragDrop() {
    const drop = $("drop-area");
    const fileInput = $("file-input");
    const preview = $("preview-img");

    if (!drop || !fileInput || !preview) return;

    // evitar comportamiento por defecto en drag & drop
    ["dragenter", "dragover", "dragleave", "drop"].forEach((ev) => {
      drop.addEventListener(ev, (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    });

    ["dragenter", "dragover"].forEach((ev) =>
      drop.addEventListener(ev, () => drop.classList.add("is-dragover"))
    );

    ["dragleave", "drop"].forEach((ev) =>
      drop.addEventListener(ev, () => drop.classList.remove("is-dragover"))
    );

    drop.addEventListener("drop", (e) => {
      const file = e.dataTransfer.files[0];
      leerImagen(file);
    });

    // click en el área → abrir input sin hacer submit
    drop.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      fileInput.click();
    });

    // cambio en el input de archivo
    fileInput.addEventListener("change", (e) => {
      e.stopPropagation();
      const file = e.target.files[0];
      leerImagen(file);
    });

    function leerImagen(file) {
      if (!file || !file.type.startsWith("image/")) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        preview.src = e.target.result;
        preview.style.display = "block";
        imagenTemporal = e.target.result; // guardar para el vehículo
      };

      reader.readAsDataURL(file);
    }
  }*/

  // ======================================================================
  // COOKIES
  // ======================================================================
  function activarCookies() {
    const banner = $("cookie-banner");
    if (!banner) return;

    const ya = localStorage.getItem("cookies_aceptadas");
    if (ya) {
      banner.style.display = "none";
      return;
    }

    $("cookie-accept").addEventListener("click", () => {
      const prefs = {
        obligatorias: true,
        marketing: $("cookie-marketing").checked,
        tracking: $("cookie-tracking").checked,
      };

      localStorage.setItem("cookies_aceptadas", JSON.stringify(prefs));
      banner.style.display = "none";
    });
  }

  // ======================================================================
  // OPERARIO
  // ======================================================================
  function pedirOperario() {
    if (!operario) {
      const entrada = prompt("Introduce operario:");
      const nombre = entrada?.trim() || "Anónimo";
      establecerOperario(nombre);
    } else {
      $("saludo").textContent = operario;
    }
  }

  function cambiarOperario() {
    const entrada = prompt("Nuevo operario:");
    const nombre = entrada?.trim() || "Anónimo";
    establecerOperario(nombre);
  }

  // ======================================================================
  // INICIO APP
  // ======================================================================
  function activarMenu() {
    document.querySelectorAll(".menu-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.target;

        if (target === "listado") verListado();
        if (target === "cambiarOperario") cambiarOperario();

        mostrarVista(target);
      });
    });

    // botones "Volver" genéricos
    document.querySelectorAll(".btnVolver").forEach((btn) => {
      btn.addEventListener("click", () => mostrarVista("home"));
    });
  }

  function iniciar() {
    cargarEstado();
    pedirOperario();
    renderContadores();
    activarMenu();
    activarFormularios();
    activarCookies();
    mostrarVista("home");
  }

  function activarFormularios() {
    $("formRegistro").addEventListener("submit", registrarVehiculo);
    $("formEntrada").addEventListener("submit", registrarEntrada);
    $("formSalida").addEventListener("submit", registrarSalida);
  }

  document.addEventListener("DOMContentLoaded", iniciar);
})();
