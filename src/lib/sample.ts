import type {
  Achievement,
  Education,
  Meeting,
  Media,
  Profile,
} from "./types";

/**
 * Datos precargados (hoja de vida y propuesta de Edwin Janes Patiño Minotta).
 * Se usan solo mientras Supabase no está configurado, para ver el sitio de
 * inmediato. Cuando Supabase esté conectado, estos datos se cargan con
 * supabase/seed.sql y se editan desde la base.
 */

export const sampleProfile: Profile = {
  full_name: "Edwin Janes Patiño Minotta",
  profession: "Abogado y contador público · Expersonero Distrital",
  headline:
    "Bonaverense, nacido en el río Naya. Abogado y contador público con trayectoria como concejal, director administrativo y financiero de la Universidad del Pacífico y Personero Distrital de Buenaventura. Aspirante a la Alcaldía Distrital 2028–2031.",
  bio: "Abogado y contador público, con especializaciones en Intervención Social Comunitaria, Cultura de Paz y Derecho Internacional Humanitario, y Gerencia Financiera. Su trayectoria reúne el conocimiento jurídico, la administración de recursos, la defensa de los derechos humanos y el trabajo con comunidades, con experiencia en el Concejo de Buenaventura, la Universidad del Pacífico y la Personería Distrital.",
  email: "edwinjanes1973@gmail.com",
  phone: "315 421 8738",
  location: "Buenaventura, Valle del Cauca",
  photo_url: "/edwin-patino.jpg",
  linkedin: "",
  instagram: "",
  youtube: "",
  whatsapp: "573154218738",
  career_start_year: 2012,
};

function degree(
  n: number,
  level: Education["level"],
  program: string,
  description = "",
): Education {
  return {
    id: `e${n}`,
    level,
    program,
    university: "",
    year: null,
    description,
    logo_url: "",
    sort_order: n,
  };
}

export const sampleEducation: Education[] = [
  degree(1, "especializacion", "Especialista en Cultura de Paz y Derecho Internacional Humanitario"),
  degree(2, "especializacion", "Especialista en Intervención Social Comunitaria"),
  degree(3, "especializacion", "Especialista en Gerencia Financiera"),
  degree(4, "pregrado", "Abogado"),
  degree(5, "pregrado", "Contador Público"),
];

export const sampleMeetings: Meeting[] = [];

export const sampleAchievements: Achievement[] = [
  {
    id: "a1",
    title: "Personero Distrital de Buenaventura",
    year: 2020,
    description:
      "2020–2024. Defensa y promoción de los derechos humanos, protección de la población vulnerable y vigilancia de la gestión pública. Atendió a víctimas del conflicto, líderes sociales y jóvenes, y recorrió la zona rural para atender a víctimas del desplazamiento forzado.",
    sort_order: 1,
  },
  {
    id: "a2",
    title: "Director Administrativo y Financiero, Universidad del Pacífico",
    year: 2017,
    description:
      "2017–2019. Gestión administrativa y financiera de una institución pública de educación superior: planeación, manejo responsable de recursos y fortalecimiento institucional.",
    sort_order: 2,
  },
  {
    id: "a3",
    title: "Presidente del Concejo Distrital de Buenaventura",
    year: 2014,
    description:
      "Durante su presidencia se aprobó el Acuerdo 007 de 2014, que crea las localidades Urbana y Suburbana del Distrito y establece su organización y funcionamiento.",
    sort_order: 3,
  },
  {
    id: "a4",
    title: "Concejal de Buenaventura",
    year: 2012,
    description:
      "2012–2015. Deliberación pública, representación ciudadana y control político en el Concejo Distrital.",
    sort_order: 4,
  },
  {
    id: "a5",
    title: "Departamento Nacional de Planeación y Gobernación del Valle",
    year: null,
    description:
      "Labores de apoyo y articulación en derechos humanos y paz: seguimiento a compromisos del Plan Nacional de Desarrollo con comunidades negras, afrocolombianas, raizales y palenqueras (NARP). En la Gobernación del Valle, experiencia contractual en seguridad, justicia y convivencia ciudadana.",
    sort_order: 5,
  },
];

export const sampleGallery: Media[] = [];
