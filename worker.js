// ============================================================
// Cloudflare Worker — chatbot + recordatorios automáticos por correo
// Despliega en Cloudflare Workers (plan gratis, sin tarjeta).
//
// Secretos necesarios (Settings → Variables and Secrets → tipo "Secret"):
//   GEMINI_API_KEY                    -> https://aistudio.google.com/apikey
//   FIREBASE_PROJECT_ID               -> "magma-a59be"
//   FIREBASE_SERVICE_ACCOUNT_EMAIL    -> del JSON de la cuenta de servicio (ver INSTRUCCIONES.md)
//   FIREBASE_SERVICE_ACCOUNT_KEY      -> el "private_key" completo del mismo JSON
//   EMAILJS_SERVICE_ID                -> de tu cuenta EmailJS (servicio conectado a Gmail)
//   EMAILJS_TEMPLATE_ID               -> plantilla de correo en EmailJS
//   EMAILJS_PUBLIC_KEY                -> "Public Key" de EmailJS
//   EMAILJS_PRIVATE_KEY               -> "Private Key" de EmailJS (para uso desde servidor)
//
// Además, en el dashboard de Cloudflare: tu Worker → Triggers → Cron Triggers →
// agrega algo como "0 13 * * *" (13:00 UTC = 8:00 a.m. en Colombia, todos los días).
// ============================================================

const CABECERAS_CORS = {
  "Access-Control-Allow-Origin": "*",
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
- El inquilino puede enviar quejas o peticiones desde su panel y el administrador responde ahí mismo.

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
  },

  // Se ejecuta solo según el Cron Trigger que configures en el dashboard de Cloudflare.
  async scheduled(evento, env, ctx) {
    ctx.waitUntil(enviarRecordatoriosDelDia(env));
  }
};

// ============================================================
// 💬 CHATBOT (sin cambios de fondo, mismo proxy hacia Gemini)
// ============================================================

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

    if (!respuestaGemini.ok) {
      const detalle = await respuestaGemini.text();
      console.error("Error de Gemini:", respuestaGemini.status, detalle);
      return respuestaJson({ respuesta: "Lo siento, no pude generar una respuesta en este momento." });
    }

    const datos = await respuestaGemini.json();
    const texto =
      datos?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Lo siento, no pude generar una respuesta en este momento.";

    return respuestaJson({ respuesta: texto });
  } catch (error) {
    console.error("Error en /chat:", error);
    return respuestaJson({ error: error.message }, 500);
  }
}

function respuestaJson(objeto, status = 200) {
  return new Response(JSON.stringify(objeto), {
    status,
    headers: { "Content-Type": "application/json", ...CABECERAS_CORS }
  });
}

// ============================================================
// 📧 RECORDATORIOS AUTOMÁTICOS (Cron Trigger diario)
// ============================================================

async function enviarRecordatoriosDelDia(env) {
  try {
    const token = await obtenerTokenGoogle(env);
    const inquilinos = await leerInquilinos(env, token);
    const hoy = new Date();

    for (const inquilino of inquilinos) {
      if (!inquilino.diaPago || !inquilino.email) continue;

      let proximo = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), inquilino.diaPago));
      if (proximo < hoy) {
        proximo = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth() + 1, inquilino.diaPago));
      }
      const diasRestantes = Math.round((proximo - hoy) / (1000 * 60 * 60 * 24));

      if (diasRestantes === 2) {
        await enviarCorreoRecordatorio(env, inquilino);
      }
    }
  } catch (error) {
    console.error("Error enviando recordatorios:", error);
  }
}

// --- Autenticación de Google con cuenta de servicio (JWT firmado con RS256) ---

async function obtenerTokenGoogle(env) {
  const ahora = Math.floor(Date.now() / 1000);
  const encabezado = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const cuerpo = base64url(JSON.stringify({
    iss: env.FIREBASE_SERVICE_ACCOUNT_EMAIL,
    scope: "https://www.googleapis.com/auth/datastore",
    aud: "https://oauth2.googleapis.com/token",
    exp: ahora + 3600,
    iat: ahora
  }));
  const sinFirmar = `${encabezado}.${cuerpo}`;

  const pem = env.FIREBASE_SERVICE_ACCOUNT_KEY
    .replace(/\\n/g, "\n")
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");
  const bytesClave = Uint8Array.from(atob(pem), c => c.charCodeAt(0));

  const claveCripto = await crypto.subtle.importKey(
    "pkcs8",
    bytesClave.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const firma = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    claveCripto,
    new TextEncoder().encode(sinFirmar)
  );
  const firmaBase64 = base64url(String.fromCharCode(...new Uint8Array(firma)));

  const jwt = `${sinFirmar}.${firmaBase64}`;

  const respuesta = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt
    })
  });
  const datos = await respuesta.json();
  if (!datos.access_token) throw new Error("No se pudo obtener token de Google: " + JSON.stringify(datos));
  return datos.access_token;
}

function base64url(texto) {
  return btoa(texto).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// --- Lectura de Firestore vía REST (con el token de la cuenta de servicio) ---

async function leerInquilinos(env, token) {
  const respuesta = await fetch(
    `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/inquilinos?pageSize=300`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const datos = await respuesta.json();
  return (datos.documents || []).map(parsearDocumentoFirestore);
}

function parsearDocumentoFirestore(documento) {
  const objeto = {};
  for (const [clave, valor] of Object.entries(documento.fields || {})) {
    if ("stringValue" in valor) objeto[clave] = valor.stringValue;
    else if ("integerValue" in valor) objeto[clave] = Number(valor.integerValue);
    else if ("doubleValue" in valor) objeto[clave] = valor.doubleValue;
    else if ("booleanValue" in valor) objeto[clave] = valor.booleanValue;
    else objeto[clave] = null;
  }
  return objeto;
}

// --- Envío de correo con EmailJS (usando tu Gmail conectado) ---

async function enviarCorreoRecordatorio(env, inquilino) {
  const respuesta = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id: env.EMAILJS_SERVICE_ID,
      template_id: env.EMAILJS_TEMPLATE_ID,
      user_id: env.EMAILJS_PUBLIC_KEY,
      accessToken: env.EMAILJS_PRIVATE_KEY,
      template_params: {
        to_email: inquilino.email,
        to_name: inquilino.nombre || "inquilino",
        dia_pago: inquilino.diaPago
      }
    })
  });

  if (!respuesta.ok) {
    console.error("Error enviando correo a", inquilino.email, await respuesta.text());
  }
}