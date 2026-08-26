// ⚠️ Debe ser la misma URL de tu Worker, con https:// al inicio
const WORKER_URL = "https://worker-chatbot.vargasjuanexterno.workers.dev";

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
    // Le mandamos el catálogo actual de habitaciones (precio, piso, descripción) para
    // que el chatbot siempre responda con la info real de script.js, sin necesitar
    // que la dupliques a mano dentro del Worker.
    const catalogoHabitaciones = (window.habitaciones || []).map(h => ({
      nombre: h.nombre,
      piso: h.piso,
      precio: h.precio,
      disponible: h.disponible,
      descripcion: h.descripcion
    }));

    const respuesta = await fetch(`${WORKER_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mensaje, historial: historialChat, catalogoHabitaciones })
    });

    document.getElementById("chat-cargando")?.remove();

    if (!respuesta.ok) {
      // El Worker respondió, pero con un error (revisa los Logs del Worker en Cloudflare)
      console.error("El Worker respondió con error:", respuesta.status, await respuesta.text());
      agregarBurbuja("El asistente tuvo un problema respondiendo. Intenta de nuevo.", "bot");
      return;
    }

    const datos = await respuesta.json();
    const textoRespuesta = datos.respuesta || "Hubo un error, intenta de nuevo.";
    agregarBurbuja(textoRespuesta, "bot");

    historialChat.push({ rol: "usuario", texto: mensaje });
    historialChat.push({ rol: "bot", texto: textoRespuesta });
    if (historialChat.length > 12) historialChat = historialChat.slice(-12);
  } catch (error) {
    // Esto es un fallo de RED (el fetch nunca llegó a completarse): URL mal escrita,
    // Worker no desplegado, o CORS. El error real queda en la consola para depurar.
    document.getElementById("chat-cargando")?.remove();
    console.error("No se pudo conectar con el Worker del chatbot:", error);
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