"use server";

import { getSupabase } from "@/lib/supabase";

export type ContactValues = { name: string; email: string; message: string };

export type ContactState = {
  status: "idle" | "ok" | "error";
  message: string;
  values: ContactValues;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function sendMessage(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const values: ContactValues = {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    message: String(formData.get("message") ?? "").trim(),
  };
  const empty: ContactValues = { name: "", email: "", message: "" };
  const fail = (message: string): ContactState => ({
    status: "error",
    message,
    values,
  });

  // Campo trampa: los bots lo llenan, las personas no lo ven.
  if (String(formData.get("website") ?? "") !== "") {
    return { status: "ok", message: "Mensaje enviado.", values: empty };
  }

  if (!values.name || values.name.length > 120) {
    return fail("Escribe tu nombre (máximo 120 caracteres).");
  }
  if (!EMAIL.test(values.email) || values.email.length > 200) {
    return fail("Escribe un correo válido.");
  }
  if (!values.message || values.message.length > 4000) {
    return fail("Escribe tu mensaje (máximo 4000 caracteres).");
  }

  const sb = getSupabase();
  if (!sb) {
    return fail(
      "El formulario aún no está conectado a la base de datos. Escríbeme directamente por correo.",
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_EMAIL_FROM;
  const to = process.env.CONTACT_EMAIL_TO || "sistemadredwin@gmail.com";
  if (!apiKey || !from) {
    return fail(
      "El envío de correo aún no está configurado. Escríbeme directamente por correo.",
    );
  }

  let emailResponse: Response;
  try {
    emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: values.email,
        subject: "Nuevo mensaje desde el sitio web",
        text: `Nombre: ${values.name}\nCorreo: ${values.email}\n\nMensaje:\n${values.message}`,
      }),
    });
  } catch (error) {
    console.error("No se pudo conectar con Resend:", error);
    return fail(
      "No pude enviar el correo. Inténtalo de nuevo en un momento.",
    );
  }

  if (!emailResponse.ok) {
    console.error("Resend rechazó el correo:", emailResponse.status);
    return fail(
      "No se pudo enviar el correo. Revisa la configuración e inténtalo de nuevo.",
    );
  }

  const { error } = await sb.from("messages").insert(values);
  if (error) {
    console.error("Supabase no pudo guardar el mensaje:", error.message);
    return {
      status: "ok",
      message:
        "Tu correo fue enviado, pero no se pudo guardar una copia en el sistema.",
      values: empty,
    };
  }
  return {
    status: "ok",
    message: `¡Gracias! Tu mensaje fue enviado a ${to}.`,
    values: empty,
  };
}
