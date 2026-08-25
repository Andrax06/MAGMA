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
import { getFirestore, doc, setDoc, getDoc, updateDoc, query, collection, where, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// 🔧 CONFIG FIREBASE
// Esta configuración NO es secreta: identifica tu proyecto, no da permisos por sí sola.
// La seguridad real vive en las reglas de Firestore (firestore.rules) y en Firebase Auth.
const firebaseConfig = {
  apiKey: "AIzaSyCe--wCqXIGLr7ookvqjAC-KtAR9QgTF-Y",
  authDomain: "magma-a59be.firebaseapp.com",
  projectId: "magma-a59be",
  storageBucket: "magma-a59be.firebasestorage.app",
  messagingSenderId: "391594872504",
  appId: "1:391594872504:web:93035b275a225d05f16e4d",
  measurementId: "G-QCHLF4MGLD"
};

const storage = getStorage();
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

// ⚠️ URL de tu Cloudflare Worker (ver worker.js). Reemplázala cuando la despliegues.
const WORKER_URL = "https://tu-worker.tu-usuario.workers.dev";

// ============================================================
// 🔐 AUTENTICACIÓN
// ============================================================

window.registrarInquilino = async function (email, password, nombre) {
  try {
    const credencial = await createUserWithEmailAndPassword(auth, email, password);
    const uid = credencial.user.uid;

    await setDoc(doc(db, "inquilinos", uid), {
      nombre: nombre,
      email: email,
      habitacionId: null,
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

onAuthStateChanged(auth, (user) => {
  const eventoSesion = new CustomEvent("sesion-cambiada", { detail: { user } });
  window.dispatchEvent(eventoSesion);
});

// ============================================================
// 💳 PAGO CON WOMPI (firma de integridad calculada en el Worker)
// ============================================================

window.pagarHabitacion = async function (habitacionId) {
  const monto = 400000; // COP
  const usuario = auth.currentUser;
  if (!usuario) {
    alert("Debes iniciar sesión antes de pagar.");
    return;
  }

  const referencia = "hab_" + habitacionId + "_" + Date.now();

  await setDoc(doc(db, "pagos", referencia), {
    uid: usuario.uid,
    habitacion: habitacionId,
    monto: monto,
    estado: "pendiente",
    fecha: new Date().toISOString()
  });

  let firma;
  try {
    const respuesta = await fetch(`${WORKER_URL}/firmar-pago`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ referencia, monto })
    });
    if (!respuesta.ok) throw new Error("No se pudo generar la firma de pago");
    const datos = await respuesta.json();
    firma = datos.firma;
  } catch (error) {
    alert("Error preparando el pago: " + error.message);
    return;
  }

  const params = new URLSearchParams({
    "public-key": "TU_LLAVE_PUBLICA_WOMPI",
    "currency": "COP",
    "amount-in-cents": String(monto * 100),
    "reference": referencia,
    "signature:integrity": firma
  });

  window.open(`https://checkout.wompi.co/p/?${params.toString()}`, "_blank");
};

// ============================================================
// 📎 SUBIR COMPROBANTE DE PAGO (Firebase Storage)
// ============================================================

window.subirComprobante = async function (habitacionId) {
  const usuario = auth.currentUser;
  if (!usuario) {
    alert("Debes iniciar sesión antes de subir un comprobante.");
    return;
  }

  const input = document.getElementById(`comprobante-${habitacionId}`);
  const estadoTexto = document.getElementById(`estado-${habitacionId}`);
  const archivo = input?.files?.[0];

  if (!archivo) {
    alert("Selecciona un archivo primero.");
    return;
  }

  estadoTexto.textContent = "Estado: subiendo comprobante...";

  try {
    // 1) Subir el archivo a Storage, organizado por usuario y habitación
    const ruta = `comprobantes/${usuario.uid}/hab_${habitacionId}_${Date.now()}_${archivo.name}`;
    const referenciaStorage = ref(storage, ruta);
    await uploadBytes(referenciaStorage, archivo);

    // 2) Buscar el pago "pendiente" más reciente de esta habitación para este usuario
    const q = query(
      collection(db, "pagos"),
      where("uid", "==", usuario.uid),
      where("habitacion", "==", habitacionId),
      orderBy("fecha", "desc"),
      limit(1)
    );
    const resultados = await getDocs(q);

    if (resultados.empty) {
      estadoTexto.textContent = "Estado: comprobante subido, pero no encontré un pago iniciado. Contáctanos por WhatsApp.";
      return;
    }

    const pagoDoc = resultados.docs[0];
    await updateDoc(doc(db, "pagos", pagoDoc.id), {
      comprobanteRuta: ruta,
      estado: "en_revision"
    });

    estadoTexto.textContent = "Estado: comprobante recibido, en revisión.";
  } catch (error) {
    estadoTexto.textContent = "Estado: error al subir el comprobante.";
    alert("Error: " + error.message);
  }
};