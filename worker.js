// ============================================================
// Cloudflare Worker — proxy seguro del chatbot
// Despliega en Cloudflare Workers (plan gratis, sin tarjeta).
// Guarda como "Secret" en Settings → Variables and Secrets:
//   GEMINI_API_KEY  -> tu clave de https://aistudio.google.com/apikey
// ============================================================

const CABECERAS_CORS = {
  "Access-Control-Allow-Origin": "*", // en producción, reemplaza * por tu dominio de GitHub Pages
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

const CONTEXTO_NEGOCIO = `
Eres el asistente virtual de una residencia de alquiler de habitaciones en Colombia.
SOLO respondes preguntas relacionadas con: disponibilidad de habitaciones, precios,
ubicación, normas de convivencia, y cómo funciona el registro/panel de inquilino en el sitio.

Datos del negocio:
- Hay 5 pisos con habitaciones individuales.
- Precio estándar: 400.000 COP/mes por habitación.
- Los pagos se hacen por fuera del sitio (transferencia/Nequi); el inquilino sube su
  comprobante desde su panel una vez inicia sesión.
- Para reservar, el usuario debe registrarse primero con correo y contraseña; luego el
  administrador le asigna la habitación.

Si te preguntan algo fuera de estos temas, responde amablemente que solo puedes ayudar
con temas de la residencia y sugiere contactar por WhatsApp para lo demás. Sé breve y cordial.
`;

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CABECERAS_CORS });
    }

    const url = new URL(request.url);
    if (url.pathname === "/chat" && request.method === "POST") {
      return manejarChat(request, env);
    }

    return new Response("No encontrado", { status: 404, headers: CABECERAS_CORS });
  }
};

async function manejarChat(request, env) {
  try {
    const { mensaje, historial } = await request.json();
    if (!mensaje) return respuestaJson({ error: "Falta el mensaje" }, 400);

    const contents = [
      ...(historial || []).map(m => ({
        role: m.rol === "usuario" ? "user" : "model",
        parts: [{ text: m.texto }]
      })),
      { role: "user", parts: [{ text: mensaje }] }
    ];

    const respuestaGemini = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: CONTEXTO_NEGOCIO }] },
          contents,
          generationConfig: { temperature: 0.4, maxOutputTokens: 300 }
        })
      }
    );

    const datos = await respuestaGemini.json();
    const texto =
      datos?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Lo siento, no pude generar una respuesta en este momento.";

    return respuestaJson({ respuesta: texto });
  } catch (error) {
    return respuestaJson({ error: error.message }, 500);
  }
}

function respuestaJson(objeto, status = 200) {
  return new Response(JSON.stringify(objeto), {
    status,
    headers: { "Content-Type": "application/json", ...CABECERAS_CORS }
  });
}