export type Status = "publica" | "oculta" | "borrador";

export type Profile = {
  full_name: string;
  profession: string;
  headline: string;
  bio: string;
  email: string;
  phone: string;
  location: string;
  photo_url: string;
  linkedin: string;
  instagram: string;
  youtube: string;
  whatsapp: string;
  career_start_year: number | null;
};

export type EducationLevel =
  | "pregrado"
  | "especializacion"
  | "maestria"
  | "doctorado";

export type Education = {
  id: string;
  level: EducationLevel;
  program: string;
  university: string;
  year: number | null;
  description: string;
  logo_url: string;
  sort_order: number;
};

export type Media = {
  id: string;
  meeting_id: string | null;
  kind: "foto" | "video";
  url: string;
  thumb_url: string;
  duration_seconds: number | null;
  caption: string;
  sort_order: number;
};

export type MeetingKind = "trabajo" | "audiencia" | "charla" | "otro";

export type Meeting = {
  id: string;
  slug: string;
  title: string;
  meeting_date: string; // YYYY-MM-DD
  kind: MeetingKind;
  place: string;
  context: string;
  actions: string;
  result: string;
  media: Media[];
  updated_at?: string; // lo devuelve Supabase; no existe en los datos de ejemplo
};

export type Achievement = {
  id: string;
  title: string;
  year: number | null;
  description: string;
  sort_order: number;
};

export type Stats = {
  titles: number;
  universities: number;
  meetings: number;
  years: number | null;
};
