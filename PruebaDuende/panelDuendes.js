"use strict";

// GLOBALES

let niños = JSON.parse(localStorage.getItem("NIÑOS_KEY") || "[]");
let duende = null;

const KEY_NIÑOS = "NIÑOS_KEY";
const KEY_DUENDE = "NIÑOS_DUENDE";

// CARGAR DUENDE

function cargarDuende() {
  const guardado = localStorage.getItem(KEY_DUENDE);

  if (guardado) {
    duende = guardado;
  } else {
    let entrada = prompt("Introduce el nombre del duende");
    entrada = entrada?.trim() || "Anónimo";

    duende = entrada;
    localStorage.setItem(KEY_DUENDE, duende);
  }
}

// MOSTRAR DUENDE

function mostrarDuende() {
  const h2 = document.getElementById("duende");
  if (!h2) return;

  h2.innerHTML = "";

  const span1 = document.createElement("span");
  span1.textContent = "Bienvenido ";

  const span2 = document.createElement("span");
  span2.textContent = duende;

  h2.appendChild(span1);
  h2.appendChild(span2);
}

// CAMBIAR DUENDE

function cambiarDuende() {
  const btn = document.getElementById("cambiar");
  btn.addEventListener("click", () => {
    let entrada = prompt("Introduce el nuevo nombre del duende");
    entrada = entrada?.trim() || "Anónimo";

    duende = entrada;
    localStorage.setItem(KEY_DUENDE, duende);

    mostrarDuende();
  });
}


// FORMULARIO DINÁMICO

function generoFormulario() {
  const section = document.getElementById("registro");

  const form = document.createElement("form");
  form.id = "formRegistro";

  form.innerHTML = `
    <input type="text" name="nombre" class="campo" placeholder="Nombre del niño">

    <select name="comportamiento" id="comportamiento" class="campo">
      <option value="">-- Selecciona comportamiento --</option>
      <option value="bueno">Bueno</option>
      <option value="regular">Regular</option>
      <option value="malo">Malo</option>
    </select>

    <input type="date" name="fechaObjetivo" class="campo">

    <input type="number" name="cantidadRegalos" class="campo" placeholder="Cantidad de regalos">
  `;

  const jug = document.getElementById("jugueteContainer");
  section.insertBefore(form, jug);
}


// SELECT DE JUGUETES

function generarSelect() {
  const comportamiento = document.getElementById("comportamiento");
  const jugueteCont = document.getElementById("jugueteContainer");

  comportamiento.addEventListener("change", () => {
    if (comportamiento.value === "bueno") {
      jugueteCont.innerHTML = `
        <select name="juguete" class="campo">
          <option value="Pelota">Pelota</option>
          <option value="Muñeca">Muñeca</option>
          <option value="Coche">Coche</option>
        </select>
      `;
    } else {
      jugueteCont.innerHTML = "";
    }
  });
}


// CLASE NIÑO

class Niño {
  constructor(nombre, comportamiento, duende, fechaObjetivo, cantidadRegalos) {
    this.nombre = nombre;
    this.comportamiento = comportamiento;
    this.duende = duende;

    this.fechaObjetivo = new Date(fechaObjetivo);
    this.cantidadRegalos = cantidadRegalos;

    this.segundosRestantes = this.calcularSegundosRestantes();
  }

  calcularSegundosRestantes() {
    const ahora = new Date();
    return Math.floor((this.fechaObjetivo - ahora) / 1000);
  }

  formatoCuentaAtras() {
    let s = this.segundosRestantes;
    if (s <= 0) return "¡Completado!";

    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const seg = s % 60;

    return `${h}h ${m}m ${seg}s`;
  }
}


// REGISTRAR NIÑO

function registarNiño() {
  const boton = document.getElementById("registrar");

  boton.addEventListener("click", () => {
    const nombre = document.querySelector("input[name='nombre']").value.trim();
    const comportamiento = document.getElementById("comportamiento").value;
    const fecha = document.querySelector("input[name='fechaObjetivo']").value;
    const regalos = Number(
      document.querySelector("input[name='cantidadRegalos']").value
    );

    if (!nombre) return alert("Falta el nombre");
    if (!comportamiento) return alert("Selecciona el comportamiento");
    if (!fecha) return alert("Selecciona fecha");
    if (regalos <= 0) return alert("Introduce cantidad válida");

    const nuevo = new Niño(nombre, comportamiento, duende, fecha, regalos);

    niños.push(nuevo);
    localStorage.setItem(KEY_NIÑOS, JSON.stringify(niños));

    alert("Niño registrado");
  });
}


// LISTADO

function renderLista() {
  const listado = document.getElementById("listado");

  const lista = JSON.parse(localStorage.getItem(KEY_NIÑOS) || "[]");

  listado.innerHTML = "";

  if (lista.length === 0) {
    listado.textContent = "No hay registros";
    return;
  }

  lista.forEach((ni, index) => {
    const div = document.createElement("div");
    div.classList.add("tarjetaNino");

    div.innerHTML = `
      <h4>${ni.nombre}</h4>
      <p><strong>Comportamiento:</strong> ${ni.comportamiento}</p>
      <p><strong>Duende:</strong> ${ni.duende}</p>
      <p><strong>Regalos:</strong> ${ni.cantidadRegalos}</p>
      <p><strong>Fecha objetivo:</strong> ${new Date(
        ni.fechaObjetivo
      ).toLocaleDateString()}</p>

      <p class="contadorNino" data-id="${index}"></p>
    `;

    listado.appendChild(div);
  });

  actualizarContadoresNiños();
}


// ACTUALIZAR CONTADORES POR NIÑO

function actualizarContadoresNiños() {
  const lista = JSON.parse(localStorage.getItem(KEY_NIÑOS) || "[]");

  document.querySelectorAll(".contadorNino").forEach((el) => {
    const id = el.getAttribute("data-id");
    const n = lista[id];

    if (!n) return;

    const ahora = new Date();
    let s = Math.floor((new Date(n.fechaObjetivo) - ahora) / 1000);

    if (s <= 0) {
      el.textContent = "¡Completado!";
      return;
    }

    const h = Math.floor(s / 3600);
    s %= 3600;
    const m = Math.floor(s / 60);
    const seg = s % 60;

    el.textContent = `${h}h ${m}m ${seg}s`;
  });
}


// CONTADOR GLOBAL NAVIDAD

let contadorNavidad = 0;

function calcularCuentaAtrasNavidad() {
  const ahora = new Date();
  const navidad = new Date(ahora.getFullYear(), 11, 25);

  if (ahora > navidad) {
    navidad.setFullYear(navidad.getFullYear() + 1);
  }

  contadorNavidad = Math.floor((navidad - ahora) / 1000);
}

function mostrarCuentaAtrasNavidad() {
  const p = document.getElementById("cuentaAtras");

  if (contadorNavidad <= 0) {
    p.textContent = "¡Es Navidad!";
    return;
  }

  let s = contadorNavidad;
  const d = Math.floor(s / 86400);
  s %= 86400;
  const h = Math.floor(s / 3600);
  s %= 3600;
  const m = Math.floor(s / 60);
  s %= 60;

  p.textContent = `${d}d ${h}h ${m}m ${s}s`;
}

function iniciarContadorGlobal() {
  calcularCuentaAtrasNavidad();
  mostrarCuentaAtrasNavidad();

  setInterval(() => {
    contadorNavidad--;
    mostrarCuentaAtrasNavidad();
  }, 1000);
}


// BOTONES

document.getElementById("ver").addEventListener("click", () => {
  renderLista();
  //INICIAR SOLO TRAS UNA ACCION
  iniciarContadorGlobal();
});

document.getElementById("enviar").addEventListener("click", () => {
  window.open("https://www.w3schools.com", "_blank");
});


// INICIO DEL SISTEMA

window.addEventListener("DOMContentLoaded", () => {
  cargarDuende();
  mostrarDuende();
  cambiarDuende();

  generoFormulario();
  generarSelect();
  registarNiño();

  iniciarContadorGlobal();
});
