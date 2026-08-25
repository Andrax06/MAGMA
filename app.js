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
  getFirestore, doc, setDoc, getDoc, updateDoc, addDoc,
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
const auth = getAuth();
const db = getFirestore();
const storage = getStorage();

// ⚠️ Pega aquí tu UID de administrador (Firebase Console → Authentication → copia el
// "User UID" de tu propia cuenta). Debe coincidir EXACTO con el que pongas en firestore.rules.
const ADMIN_UIDS = ["JEj4kmfHToUotLItzPA7LWu6it73"];

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
      diaPago: 5, // valor por defecto, el administrador lo puede ajustar luego
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
  window.dispatchEvent(new CustomEvent("sesion-cambiada", { detail: { user } }));
  if (user) {
    await mostrarPanelInquilino(user.uid);
  } else {
    document.getElementById("panel-inquilino").style.display = "none";
  }
});

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

  if (ADMIN_UIDS.includes(uid)) {
    document.getElementById("panel-admin").style.display = "block";
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

function pintarRecordatorio(perfil) {
  const contenedor = document.getElementById("panel-recordatorio");
  const hoy = new Date();
  let proximo = new Date(hoy.getFullYear(), hoy.getMonth(), perfil.diaPago);
  if (proximo < hoy) proximo = new Date(hoy.getFullYear(), hoy.getMonth() + 1, perfil.diaPago);

  const diasRestantes = Math.ceil((proximo - hoy) / (1000 * 60 * 60 * 24));

  contenedor.innerHTML = `
    <p>Tu pago vence el día <strong>${perfil.diaPago}</strong> de cada mes.</p>
    <p>Faltan <strong>${diasRestantes}</strong> día(s).</p>
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
    estado.textContent = "Listo. Te avisaremos cuando abras el sitio cerca de la fecha de pago.";
    revisarRecordatorioPendiente();
  });
}

// Revisa, cada vez que se carga el sitio, si hay que mostrar el aviso
// (funciona solo mientras el usuario visita el sitio; no es un recordatorio en segundo plano).
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
// 👤 PANEL DE ADMINISTRADOR (solo visible para ADMIN_UIDS)
// ============================================================

window.adminAsignarHabitacion = async function () {
  const correo = document.getElementById("admin-correo-hab").value.trim();
  const habitacionId = Number(document.getElementById("admin-habitacion-id").value);
  const diaPago = Number(document.getElementById("admin-dia-pago").value) || 5;

  const uid = await buscarUidPorCorreo(correo);
  if (!uid) return alert("No encontré un inquilino con ese correo.");

  await updateDoc(doc(db, "inquilinos", uid), { habitacionId, diaPago });
  alert("Habitación asignada correctamente.");
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
    concepto,
    monto,
    fecha: new Date().toISOString(),
    estado: "pendiente",
    comprobanteRuta: null
  });
  alert("Cargo creado correctamente.");
};

async function buscarUidPorCorreo(correo) {
  const q = query(collection(db, "inquilinos"), where("email", "==", correo));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].id;
}