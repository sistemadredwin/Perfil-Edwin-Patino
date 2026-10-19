import type { EducationLevel, MeetingKind } from "./types";

export const LEVEL_LABEL: Record<EducationLevel, string> = {
  doctorado: "Doctorado",
  maestria: "Maestría",
  especializacion: "Especialización",
  pregrado: "Pregrado",
};

export const LEVEL_ORDER: EducationLevel[] = [
  "doctorado",
  "maestria",
  "especializacion",
  "pregrado",
];

export const KIND_LABEL: Record<MeetingKind, string> = {
  trabajo: "Reunión de trabajo",
  audiencia: "Audiencia",
  charla: "Charla o evento",
  otro: "Otro",
};

export function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

export function formatDuration(seconds: number | null): string {
  if (seconds == null) return "";
  const s = Math.round(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function yearOf(iso: string): string {
  return iso.slice(0, 4);
}
