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

  const { error } = await sb.from("messages").insert(values);
  if (error) {
    return fail("No pude enviar el mensaje. Inténtalo de nuevo en un momento.");
  }
  return {
    status: "ok",
    message: "¡Gracias! Recibí tu mensaje y te responderé pronto.",
    values: empty,
  };
}
