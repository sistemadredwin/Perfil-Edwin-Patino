-- Datos reales de Edwin Janes Patiño Minotta (hoja de vida y propuesta).
-- Ejecutar DESPUÉS de schema.sql, en el SQL Editor de Supabase.
-- Se puede volver a ejecutar: borra y vuelve a cargar profile, education y achievements.
-- (No toca reuniones, fotos/videos ni mensajes.)

update public.profile set
  full_name = 'Edwin Janes Patiño Minotta',
  profession = 'Abogado y contador público · Expersonero Distrital',
  headline = 'Bonaverense, nacido en el río Naya. Abogado y contador público con trayectoria como concejal, director administrativo y financiero de la Universidad del Pacífico y Personero Distrital de Buenaventura.',
  bio = 'Abogado y contador público, con especializaciones en Intervención Social Comunitaria, Cultura de Paz y Derecho Internacional Humanitario, y Gerencia Financiera. Su trayectoria reúne el conocimiento jurídico, la administración de recursos, la defensa de los derechos humanos y el trabajo con comunidades, con experiencia en el Concejo de Buenaventura, la Universidad del Pacífico y la Personería Distrital.',
  email = 'edwinjanes1973@gmail.com',
  phone = '315 421 8738',
  location = 'Buenaventura, Valle del Cauca',
  photo_url = '/edwin-patino.jpg',
  whatsapp = '573154218738',
  career_start_year = 2012,
  updated_at = now()
where id = true;

delete from public.education;
insert into public.education (level, program, university, year, sort_order) values
  ('especializacion', 'Especialista en Cultura de Paz y Derecho Internacional Humanitario', '', null, 1),
  ('especializacion', 'Especialista en Intervención Social Comunitaria', '', null, 2),
  ('especializacion', 'Especialista en Gerencia Financiera', '', null, 3),
  ('pregrado', 'Abogado', '', null, 4),
  ('pregrado', 'Contador Público', '', null, 5);

delete from public.achievements;
insert into public.achievements (title, year, description, sort_order) values
  ('Personero Distrital de Buenaventura', 2020,
   '2020–2024. Defensa y promoción de los derechos humanos, protección de la población vulnerable y vigilancia de la gestión pública. Atendió a víctimas del conflicto, líderes sociales y jóvenes, y recorrió la zona rural para atender a víctimas del desplazamiento forzado.', 1),
  ('Director Administrativo y Financiero, Universidad del Pacífico', 2017,
   '2017–2019. Gestión administrativa y financiera de una institución pública de educación superior: planeación, manejo responsable de recursos y fortalecimiento institucional.', 2),
  ('Presidente del Concejo Distrital de Buenaventura', 2014,
   'Durante su presidencia se aprobó el Acuerdo 007 de 2014, que crea las localidades Urbana y Suburbana del Distrito y establece su organización y funcionamiento.', 3),
  ('Concejal de Buenaventura', 2012,
   '2012–2015. Deliberación pública, representación ciudadana y control político en el Concejo Distrital.', 4),
  ('Departamento Nacional de Planeación y Gobernación del Valle', null,
   'Labores de apoyo y articulación en derechos humanos y paz: seguimiento a compromisos del Plan Nacional de Desarrollo con comunidades negras, afrocolombianas, raizales y palenqueras (NARP). En la Gobernación del Valle, experiencia contractual en seguridad, justicia y convivencia ciudadana.', 5);
