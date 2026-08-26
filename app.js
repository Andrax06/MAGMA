// 🔥 IMPORTS FIREBASE
import { getStorage, ref, uploadBytes } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore, doc, setDoc, getDoc, updateDoc, addDoc, deleteDoc,
  collection, query, where, orderBy, getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// 🔧 CONFIG FIREBASE (no es secreta, la seguridad vive en firestore.rules)
const firebaseConfig = {
  apiKey: "AIzaSyCe--wCqXIGLr7ookvqjAC-KtAR9QgTF-Y",
  authDomain: "magma-a59be.firebaseapp.com",
  projectId: "magma-a59be",
  storageBucket: "magma-a59be.firebasestorage.app",
  messagingSenderId: "391594872504",
  appId: "1:391594872504:web:93035b275a225d05f16e4d",
  measurementId: "G-QCHLF4MGLD"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ⚠️ Debe coincidir EXACTO con el UID en firestore.rules
const ADMIN_UIDS = ["JEj4kmfHToUotLItzPA7LWu6it73"];

// HTML original del formulario de acceso, para poder restaurarlo al cerrar sesión
const HTML_FORM_LOGIN = `
  <div id="auth-form-login">
      <h3>Iniciar sesión</h3>
      <input id="login-email" type="email" placeholder="Correo">
      <input id="login-password" type="password" placeholder="Contraseña">
      <button onclick="manejarLogin()">Entrar</button>
      <p>¿No tienes cuenta? <a href="#" onclick="mostrarRegistro(); return false;">Regístrate</a></p>
  </div>
  <div id="auth-form-registro" style="display:none">
      <h3>Crear cuenta</h3>
      <input id="registro-nombre" type="text" placeholder="Nombre completo">
      <input id="registro-email" type="email" placeholder="Correo">
      <input id="registro-password" type="password" placeholder="Contraseña (mín. 6 caracteres)">
      <button onclick="manejarRegistro()">Registrarme</button>
  </div>
`;

// ============================================================
// 🔐 AUTENTICACIÓN
// ============================================================

window.registrarInquilino = async function (email, password, nombre) {
  try {
    const credencial = await createUserWithEmailAndPassword(auth, email, password);
    const uid = credencial.user.uid;

    await setDoc(doc(db, "inquilinos", uid), {
      nombre,
      email,
      habitacionId: null,
      diaPago: 5,
      creado: new Date().toISOString()
    });

    return { ok: true, uid };
  } catch (error) {
    return { ok: false, error: error.message };
  }
};

window.iniciarSesion = async function (email, password) {
  try {
    const credencial = await signInWithEmailAndPassword(auth, email, password);
    return { ok: true, uid: credencial.user.uid };
  } catch (error) {
    return { ok: false, error: error.message };
  }
};

window.cerrarSesion = function () {
  return signOut(auth);
};

onAuthStateChanged(auth, async (user) => {
  const caja = document.getElementById("auth-caja");

  if (user) {
    caja.innerHTML = `<p>Sesión iniciada como ${user.email}
        <button onclick="cerrarSesion()">Cerrar sesión</button></p>`;
    await mostrarPanelInquilino(user.uid);
  } else {
    // 🔧 Este es el arreglo del bug: sin esto, el formulario de login nunca
    // volvía a aparecer después de cerrar sesión.
    caja.innerHTML = HTML_FORM_LOGIN;
    document.getElementById("panel-inquilino").style.display = "none";
    document.getElementById("panel-admin").style.display = "none";
  }
});

// Sincroniza qué habitaciones ya están ocupadas (colección pública "ocupacion",
// sin datos personales) para que el catálogo no las muestre como disponibles.
// Se ejecuta siempre, con o sin sesión iniciada.
(async function sincronizarDisponibilidad() {
  try {
    const snap = await getDocs(collection(db, "ocupacion"));
    const idsOcupados = snap.docs.map(d => Number(d.id));
    if (window.actualizarDisponibilidad) window.actualizarDisponibilidad(idsOcupados);
  } catch (error) {
    console.error("No se pudo sincronizar disponibilidad:", error);
  }
})();

// ============================================================
// 🏠 PANEL DEL INQUILINO
// ============================================================

async function mostrarPanelInquilino(uid) {
  const panel = document.getElementById("panel-inquilino");
  panel.style.display = "block";

  const snapPerfil = await getDoc(doc(db, "inquilinos", uid));
  if (!snapPerfil.exists()) return;
  const perfil = snapPerfil.data();

  pintarMiHabitacion(perfil);
  pintarRecordatorio(perfil);
  await pintarCargos(uid);
  await pintarSolicitudes(uid);

  if (ADMIN_UIDS.includes(uid)) {
    document.getElementById("panel-admin").style.display = "block";
    await adminCargarInquilinos();
    await adminCargarCargos();
    await adminCargarSolicitudes();
  }
}

function pintarMiHabitacion(perfil) {
  const contenedor = document.getElementById("panel-habitacion");
  const habitaciones = window.habitaciones || [];
  const habitacion = habitaciones.find(h => h.id === perfil.habitacionId);

  if (!habitacion) {
    contenedor.innerHTML = `<p>Aún no tienes una habitación asignada. Contáctanos por WhatsApp o espera a que el administrador la asigne.</p>`;
    return;
  }

  contenedor.innerHTML = `
    <p><strong>${habitacion.nombre}</strong> — ${habitacion.precio}</p>
    <p>${habitacion.descripcion}</p>
  `;
}

// ============================================================
// 📅 RECORDATORIO (aviso en navegador; el correo automático corre en el Worker)
// ============================================================

function pintarRecordatorio(perfil) {
  const contenedor = document.getElementById("panel-recordatorio");
  const hoy = new Date();
  let proximo = new Date(hoy.getFullYear(), hoy.getMonth(), perfil.diaPago);
  if (proximo < hoy) proximo = new Date(hoy.getFullYear(), hoy.getMonth() + 1, perfil.diaPago);

  const diasRestantes = Math.ceil((proximo - hoy) / (1000 * 60 * 60 * 24));

  contenedor.innerHTML = `
    <p>Tu pago vence el día <strong>${perfil.diaPago}</strong> de cada mes.</p>
    <p>Faltan <strong>${diasRestantes}</strong> día(s).</p>
    <p style="font-size:13px;color:#666">También te llegará un correo automático 2 días antes de la fecha.</p>
    <button id="btn-activar-recordatorio">Activar aviso en este navegador</button>
    <p id="estado-recordatorio" style="font-size:13px;color:#666"></p>
  `;

  document.getElementById("btn-activar-recordatorio").addEventListener("click", () => {
    activarRecordatorioNavegador(perfil.diaPago);
  });
}

function activarRecordatorioNavegador(diaPago) {
  const estado = document.getElementById("estado-recordatorio");
  if (!("Notification" in window)) {
    estado.textContent = "Tu navegador no soporta notificaciones.";
    return;
  }
  Notification.requestPermission().then(permiso => {
    if (permiso !== "granted") {
      estado.textContent = "No se activó el permiso de notificaciones.";
      return;
    }
    localStorage.setItem("magma_dia_pago", String(diaPago));
    localStorage.setItem("magma_recordatorio_activo", "true");
    estado.textContent = "Listo. También te avisaremos si abres el sitio cerca de la fecha.";
    revisarRecordatorioPendiente();
  });
}

function revisarRecordatorioPendiente() {
  const activo = localStorage.getItem("magma_recordatorio_activo") === "true";
  const diaPago = Number(localStorage.getItem("magma_dia_pago"));
  if (!activo || !diaPago || Notification.permission !== "granted") return;

  const hoy = new Date();
  const diff = diaPago - hoy.getDate();
  if (diff >= 0 && diff <= 3) {
    new Notification("Recordatorio de pago MAGMA", {
      body: `Tu pago vence el día ${diaPago}. ¡No lo olvides!`
    });
  }
}
window.addEventListener("DOMContentLoaded", revisarRecordatorioPendiente);

// ============================================================
// 💰 CARGOS (cuentas aparte de la renta)
// ============================================================

async function pintarCargos(uid) {
  const contenedor = document.getElementById("panel-cargos");
  const q = query(collection(db, "cargos"), where("uid", "==", uid), orderBy("fecha", "desc"));
  const snap = await getDocs(q);

  if (snap.empty) {
    contenedor.innerHTML = "<p>No tienes cargos adicionales registrados.</p>";
    return;
  }

  contenedor.innerHTML = "";
  snap.forEach(docSnap => {
    const cargo = docSnap.data();
    const id = docSnap.id;
    const fila = document.createElement("div");
    fila.className = "cargo-fila";
    fila.innerHTML = `
      <p><strong>${cargo.concepto}</strong> — ${cargo.monto.toLocaleString("es-CO")} COP</p>
      <p style="font-size:13px;color:#666">Estado: ${cargo.estado}</p>
      ${cargo.estado === "pendiente" ? `
        <input type="file" id="comprobante-${id}" accept="image/*,.pdf">
        <button onclick="subirComprobanteCargo('${id}')">Subir comprobante</button>
      ` : ""}
    `;
    contenedor.appendChild(fila);
  });
}

window.subirComprobanteCargo = async function (cargoId) {
  const usuario = auth.currentUser;
  if (!usuario) return;

  const input = document.getElementById(`comprobante-${cargoId}`);
  const archivo = input?.files?.[0];
  if (!archivo) {
    alert("Selecciona un archivo primero.");
    return;
  }

  try {
    const ruta = `comprobantes/${usuario.uid}/${cargoId}_${Date.now()}_${archivo.name}`;
    await uploadBytes(ref(storage, ruta), archivo);
    await updateDoc(doc(db, "cargos", cargoId), {
      comprobanteRuta: ruta,
      estado: "en_revision"
    });
    await pintarCargos(usuario.uid);
  } catch (error) {
    alert("Error al subir el comprobante: " + error.message);
  }
};

// ============================================================
// 📝 QUEJAS Y PETICIONES
// ============================================================

window.enviarSolicitud = async function () {
  const usuario = auth.currentUser;
  if (!usuario) return alert("Debes iniciar sesión.");

  const tipo = document.getElementById("solicitud-tipo").value;
  const mensajeInput = document.getElementById("solicitud-mensaje");
  const mensaje = mensajeInput.value.trim();
  if (!mensaje) return alert("Escribe tu queja o petición antes de enviar.");

  try {
    await addDoc(collection(db, "solicitudes"), {
      uid: usuario.uid,
      email: usuario.email,
      tipo,
      mensaje,
      estado: "pendiente",
      respuestaAdmin: "",
      fecha: new Date().toISOString()
    });
    mensajeInput.value = "";
    await pintarSolicitudes(usuario.uid);
    alert("Tu solicitud fue enviada. Te responderemos aquí mismo.");
  } catch (error) {
    alert("Error al enviar: " + error.message);
  }
};

async function pintarSolicitudes(uid) {
  const contenedor = document.getElementById("panel-solicitudes-lista");
  const q = query(collection(db, "solicitudes"), where("uid", "==", uid), orderBy("fecha", "desc"));
  const snap = await getDocs(q);

  if (snap.empty) {
    contenedor.innerHTML = "<p>No has enviado quejas ni peticiones.</p>";
    return;
  }

  contenedor.innerHTML = "";
  snap.forEach(docSnap => {
    const s = docSnap.data();
    const fila = document.createElement("div");
    fila.className = "cargo-fila";
    fila.innerHTML = `
      <p><strong>${s.tipo === "queja" ? "Queja" : "Petición"}:</strong> ${s.mensaje}</p>
      <p style="font-size:13px;color:#666">Estado: ${s.estado === "pendiente" ? "Pendiente" : "Resuelta"}</p>
      ${s.respuestaAdmin ? `<p style="font-size:13px"><strong>Respuesta:</strong> ${s.respuestaAdmin}</p>` : ""}
    `;
    contenedor.appendChild(fila);
  });
}

// ============================================================
// 👤 PANEL DE ADMINISTRADOR (control total, solo visible para ADMIN_UIDS)
// ============================================================

window.adminAsignarHabitacion = async function () {
  const correo = document.getElementById("admin-correo-hab").value.trim();
  const habitacionId = Number(document.getElementById("admin-habitacion-id").value);
  const diaPago = Number(document.getElementById("admin-dia-pago").value) || 5;

  const uid = await buscarUidPorCorreo(correo);
  if (!uid) return alert("No encontré un inquilino con ese correo.");

  await updateDoc(doc(db, "inquilinos", uid), { habitacionId, diaPago });
  // Marca la habitación como ocupada en la colección pública (sin datos personales)
  await setDoc(doc(db, "ocupacion", String(habitacionId)), { ocupada: true });

  alert("Habitación asignada correctamente.");
  await adminCargarInquilinos();
  if (window.actualizarDisponibilidad) {
    const snap = await getDocs(collection(db, "ocupacion"));
    window.actualizarDisponibilidad(snap.docs.map(d => Number(d.id)));
  }
};

window.adminLiberarHabitacion = async function (uid, habitacionId) {
  if (!confirm("¿Liberar esta habitación? El inquilino dejará de verla como asignada.")) return;
  await updateDoc(doc(db, "inquilinos", uid), { habitacionId: null });
  await deleteDoc(doc(db, "ocupacion", String(habitacionId)));
  await adminCargarInquilinos();
  const snap = await getDocs(collection(db, "ocupacion"));
  if (window.actualizarDisponibilidad) window.actualizarDisponibilidad(snap.docs.map(d => Number(d.id)));
};

window.adminCrearCargo = async function () {
  const correo = document.getElementById("admin-correo-cargo").value.trim();
  const concepto = document.getElementById("admin-concepto").value.trim();
  const monto = Number(document.getElementById("admin-monto").value);

  const uid = await buscarUidPorCorreo(correo);
  if (!uid) return alert("No encontré un inquilino con ese correo.");
  if (!concepto || !monto) return alert("Completa el concepto y el monto.");

  await addDoc(collection(db, "cargos"), {
    uid,
    email: correo,
    concepto,
    monto,
    fecha: new Date().toISOString(),
    estado: "pendiente",
    comprobanteRuta: null
  });
  alert("Cargo creado correctamente.");
  await adminCargarCargos();
};

window.adminMarcarCargoPagado = async function (cargoId) {
  await updateDoc(doc(db, "cargos", cargoId), { estado: "pagado" });
  await adminCargarCargos();
};

window.adminResolverSolicitud = async function (solicitudId) {
  const respuesta = prompt("Escribe tu respuesta para el inquilino:");
  if (respuesta === null) return;
  await updateDoc(doc(db, "solicitudes", solicitudId), {
    estado: "resuelta",
    respuestaAdmin: respuesta
  });
  await adminCargarSolicitudes();
};

async function buscarUidPorCorreo(correo) {
  const q = query(collection(db, "inquilinos"), where("email", "==", correo));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].id;
}

// --- Vistas de control total ---

async function adminCargarInquilinos() {
  const contenedor = document.getElementById("admin-lista-inquilinos");
  const snap = await getDocs(collection(db, "inquilinos"));

  const total = snap.size;
  let ocupadas = 0;
  contenedor.innerHTML = "";

  snap.forEach(docSnap => {
    const i = docSnap.data();
    if (i.habitacionId) ocupadas++;
    const habitacion = (window.habitaciones || []).find(h => h.id === i.habitacionId);
    const fila = document.createElement("div");
    fila.className = "cargo-fila";
    fila.innerHTML = `
      <p><strong>${i.nombre}</strong> — ${i.email}</p>
      <p style="font-size:13px;color:#666">
        Habitación: ${habitacion ? habitacion.nombre : "sin asignar"} · Día de pago: ${i.diaPago}
      </p>
      ${i.habitacionId ? `<button onclick="adminLiberarHabitacion('${docSnap.id}', ${i.habitacionId})">Liberar habitación</button>` : ""}
    `;
    contenedor.appendChild(fila);
  });

  document.getElementById("admin-resumen").textContent =
    `${total} inquilino(s) registrados · ${ocupadas} habitación(es) ocupadas`;
}

async function adminCargarCargos() {
  const contenedor = document.getElementById("admin-lista-cargos");
  const q = query(collection(db, "cargos"), orderBy("fecha", "desc"));
  const snap = await getDocs(q);

  contenedor.innerHTML = "";
  if (snap.empty) {
    contenedor.innerHTML = "<p>No hay cargos registrados.</p>";
    return;
  }

  snap.forEach(docSnap => {
    const c = docSnap.data();
    const fila = document.createElement("div");
    fila.className = "cargo-fila";
    fila.innerHTML = `
      <p><strong>${c.concepto}</strong> — ${c.monto.toLocaleString("es-CO")} COP</p>
      <p style="font-size:13px;color:#666">${c.email || c.uid} · Estado: ${c.estado}</p>
      ${c.estado !== "pagado" ? `<button onclick="adminMarcarCargoPagado('${docSnap.id}')">Marcar como pagado</button>` : ""}
    `;
    contenedor.appendChild(fila);
  });
}

async function adminCargarSolicitudes() {
  const contenedor = document.getElementById("admin-lista-solicitudes");
  const q = query(collection(db, "solicitudes"), orderBy("fecha", "desc"));
  const snap = await getDocs(q);

  contenedor.innerHTML = "";
  if (snap.empty) {
    contenedor.innerHTML = "<p>No hay quejas ni peticiones.</p>";
    return;
  }

  snap.forEach(docSnap => {
    const s = docSnap.data();
    const fila = document.createElement("div");
    fila.className = "cargo-fila";
    fila.innerHTML = `
      <p><strong>${s.tipo === "queja" ? "Queja" : "Petición"}</strong> de ${s.email}</p>
      <p style="font-size:13px">${s.mensaje}</p>
      <p style="font-size:13px;color:#666">Estado: ${s.estado}</p>
      ${s.estado === "pendiente" ? `<button onclick="adminResolverSolicitud('${docSnap.id}')">Responder / resolver</button>` : `<p style="font-size:13px"><strong>Tu respuesta:</strong> ${s.respuestaAdmin}</p>`}
    `;
    contenedor.appendChild(fila);
  });
}