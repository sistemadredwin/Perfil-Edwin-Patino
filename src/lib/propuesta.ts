/**
 * Propuesta de gobierno "Buenaventura: segura, turística y productiva"
 * (visión integral de Distrito 2028–2031). Contenido fijo del documento de
 * propuesta; se edita aquí.
 */

export type Eje = {
  numero: number;
  titulo: string;
  proposito: string;
  puntos: { titulo: string; texto: string }[];
};

export const PROPUESTA_TITULO = "Buenaventura: segura, turística y productiva";
export const PROPUESTA_PERIODO = "Visión integral de Distrito 2028–2031";
export const PROPUESTA_LEMA =
  "Una Buenaventura donde la gente pueda vivir sin miedo, trabajar con dignidad y construir su futuro en el territorio.";

export const EJES: Eje[] = [
  {
    numero: 1,
    titulo: "Seguridad, convivencia y protección de la vida",
    proposito: "Vivir sin miedo en el territorio",
    puntos: [
      {
        titulo: "Seguridad territorial",
        texto:
          "Coordinación operativa entre Policía, Fuerza Pública y Fiscalía, con inteligencia y análisis territorial.",
      },
      {
        titulo: "Protección comunitario-rural",
        texto:
          "Rutas efectivas ante amenazas, confinamiento y desplazamiento forzado.",
      },
      {
        titulo: "Prevención de violencia juvenil",
        texto:
          "Oportunidades reales en educación, cultura, deporte y empleo formal.",
      },
      {
        titulo: "Tecnología e infraestructura",
        texto:
          "Redes de videovigilancia, iluminación pública y mecanismos de respuesta rápida.",
      },
      {
        titulo: "Justicia cercana",
        texto:
          "Presencia del Ministerio Público, justicia y atención a víctimas en la zona rural y costera.",
      },
    ],
  },
  {
    numero: 2,
    titulo: "Turismo sostenible, cultural y comunitario",
    proposito: "Oportunidades desde la biodiversidad y la cultura",
    puntos: [
      {
        titulo: "Marca turística Buenaventura",
        texto:
          "Promoción nacional e internacional del destino, en alianza con operadores locales.",
      },
      {
        titulo: "Turismo comunitario y rural",
        texto:
          "Rutas y caminos seguros diseñados junto con Consejos Comunitarios y comunidades indígenas.",
      },
      {
        titulo: "Infraestructura en destinos",
        texto:
          "Mejoras en playas, agua potable, saneamiento, manejo de residuos y conectividad.",
      },
      {
        titulo: "Gastronomía y cultura del Pacífico",
        texto:
          "Valorización de la cocina tradicional, la música, las artesanías y el avistamiento responsable de ballenas.",
      },
      {
        titulo: "Formalización y capacitación",
        texto:
          "Acompañamiento a guías, motoristas, hoteles y restaurantes locales.",
      },
    ],
  },
  {
    numero: 3,
    titulo: "Desarrollo económico, empleo y oportunidades",
    proposito: "Que la riqueza de Buenaventura se quede en su gente",
    puntos: [
      {
        titulo: "Articulación portuaria y cadena logística",
        texto:
          "Alianza con operadores para formar y contratar mano de obra local calificada.",
      },
      {
        titulo: "Compras locales",
        texto:
          "Fomento legal para que proveedores de Buenaventura vendan al sector público y privado.",
      },
      {
        titulo: "Fortalecimiento de la economía popular",
        texto:
          "Asistencia técnica y microcréditos para mujeres, jóvenes y trabajadores independientes.",
      },
      {
        titulo: "Sector pesquero y agropecuario",
        texto:
          "Acompañamiento técnico, conservación, transformación y acceso a mercados.",
      },
      {
        titulo: "Gestión financiera responsable",
        texto:
          "Estructuración de proyectos financiables y captación de inversión.",
      },
    ],
  },
];

export const COMPROMISOS: { area: string; texto: string }[] = [
  {
    area: "Educación y juventud",
    texto: "Infraestructura escolar, permanencia, universidad pública y formación técnica.",
  },
  {
    area: "Salud y bienestar",
    texto: "Atención primaria oportuna, fortalecimiento de la red pública y atención rural.",
  },
  {
    area: "Agua potable y servicios",
    texto: "Ampliación de cobertura de agua, alcantarillado, vías e infraestructura básica.",
  },
  {
    area: "Inclusión y equidad",
    texto: "Garantía de derechos para víctimas, mujeres, adultos mayores, NARP e indígenas.",
  },
  {
    area: "Ambiente y ordenamiento",
    texto: "Protección de manglares, gestión del riesgo y articulación con FonBuenaventura y el PIEDB.",
  },
];

export const PLAN: { anio: string; titulo: string; texto: string }[] = [
  {
    anio: "2028",
    titulo: "Diagnosticar y actuar",
    texto: "Líneas base, estructuración financiera, proyectos prioritarios y medidas inmediatas de seguridad.",
  },
  {
    anio: "2029",
    titulo: "Ejecutar y ampliar",
    texto: "Obras de infraestructura turística, apoyo a unidades productivas y rutas turísticas.",
  },
  {
    anio: "2030",
    titulo: "Consolidar y escalar",
    texto: "Evaluación de impacto en seguridad, encadenamientos productivos y corrección de metas.",
  },
  {
    anio: "2031",
    titulo: "Cumplir y proyectar",
    texto: "Entrega de proyectos estratégicos, rendición de cuentas e institucionalidad fortalecida.",
  },
];

export const FINANCIACION: { titulo: string; texto: string }[] = [
  { titulo: "Recursos propios", texto: "Optimización del recaudo e Ingresos Corrientes de Libre Destinación (ICLD)." },
  { titulo: "Transferencias nacionales", texto: "SGP (educación, salud, agua potable)." },
  { titulo: "Regalías (SGR)", texto: "Proyectos regionales de alto impacto social e infraestructura." },
  { titulo: "FonBuenaventura y Ley 1872 de 2017", texto: "Gestión y ejecución efectiva de recursos específicos del Distrito." },
  { titulo: "Cofinanciación y cooperación", texto: "Alianzas con el Gobierno Nacional, la Gobernación del Valle y la cooperación internacional." },
];
