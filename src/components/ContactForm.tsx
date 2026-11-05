"use client";

import { useActionState } from "react";
import {
  sendMessage,
  type ContactState,
} from "@/app/contacto/actions";

const initialState: ContactState = {
  status: "idle",
  message: "",
  values: { name: "", email: "", message: "" },
};

export function ContactForm() {
  const [state, action, pending] = useActionState(sendMessage, initialState);

  return (
    <form className="form-card" action={action}>
      <div className="field">
        <label htmlFor="c-name">Nombre</label>
        <input
          id="c-name"
          name="name"
          type="text"
          autoComplete="name"
          maxLength={120}
          required
          defaultValue={state.values.name}
        />
      </div>
      <div className="field">
        <label htmlFor="c-email">Correo</label>
        <input
          id="c-email"
          name="email"
          type="email"
          autoComplete="email"
          maxLength={200}
          required
          defaultValue={state.values.email}
        />
      </div>
      <div className="field">
        <label htmlFor="c-message">Mensaje</label>
        <textarea
          id="c-message"
          name="message"
          rows={5}
          maxLength={4000}
          required
          defaultValue={state.values.message}
        />
      </div>

      {/* Campo trampa anti-spam */}
      <div className="hp" aria-hidden="true">
        <label htmlFor="c-website">No llenes este campo</label>
        <input
          id="c-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {state.status !== "idle" && (
        <p
          role="status"
          className={`notice ${state.status === "ok" ? "notice-ok" : "notice-error"}`}
        >
          {state.message}
        </p>
      )}

      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Enviando…" : "Enviar mensaje"}
      </button>
    </form>
  );
}
