// ⚠️ Debe ser la misma URL que pusiste en app.js
const WORKER_URL = "worker-chatbot.vargasjuanexterno.workers.dev";

let historialChat = [];

function alternarChat() {
  const panel = document.getElementById("chat-panel");
  panel.style.display = panel.style.display === "flex" ? "none" : "flex";
}

async function enviarMensajeChat() {
  const input = document.getElementById("chat-input");
  const mensaje = input.value.trim();
  if (!mensaje) return;

  agregarBurbuja(mensaje, "usuario");
  input.value = "";
  agregarBurbuja("Escribiendo...", "bot", "chat-cargando");

  try {
    const respuesta = await fetch(`${WORKER_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mensaje, historial: historialChat })
    });
    const datos = await respuesta.json();

    document.getElementById("chat-cargando")?.remove();

    const textoRespuesta = datos.respuesta || "Hubo un error, intenta de nuevo.";
    agregarBurbuja(textoRespuesta, "bot");

    historialChat.push({ rol: "usuario", texto: mensaje });
    historialChat.push({ rol: "bot", texto: textoRespuesta });

    // Evita que el historial crezca sin límite
    if (historialChat.length > 12) historialChat = historialChat.slice(-12);
  } catch (error) {
    document.getElementById("chat-cargando")?.remove();
    agregarBurbuja("No pude conectarme. Intenta de nuevo en un momento.", "bot");
  }
}

function agregarBurbuja(texto, tipo, id) {
  const contenedor = document.getElementById("chat-mensajes");
  const burbuja = document.createElement("div");
  burbuja.className = `chat-burbuja chat-burbuja-${tipo}`;
  if (id) burbuja.id = id;
  burbuja.textContent = texto;
  contenedor.appendChild(burbuja);
  contenedor.scrollTop = contenedor.scrollHeight;
}

window.alternarChat = alternarChat;
window.enviarMensajeChat = enviarMensajeChat;

document.addEventListener("DOMContentLoaded", () => {
  agregarBurbuja("¡Hola! Soy el asistente de la residencia. Pregúntame sobre disponibilidad, precios o el proceso de pago.", "bot");

  document.getElementById("chat-input")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") enviarMensajeChat();
  });
});