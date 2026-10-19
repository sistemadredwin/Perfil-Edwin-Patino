# Perfil profesional

Sitio de presentación para un profesional (abogado, contador, etc.): formación,
reuniones ya realizadas, logros, galería de fotos y videos cortos (máx. 30 s) y
contacto. Navegación por pestañas, paleta azul marino y gris negro con el
acento amarillo y verde de la bandera de Buenaventura.

**Stack:** Next.js 16 (App Router, Cache Components) · Supabase (base de datos,
login y permisos) · Cloudinary (fotos y videos, fase 3) · Vercel.

## Estado

| Fase | Contenido | Estado |
|---|---|---|
| 1 | Sitio público, esquema de Supabase, formulario de contacto, chequeo de salud | **Hecha** |
| 2 | Panel `/admin` con acceso y gestión de perfil, formación, reuniones, logros y galería | **Implementado** |
| 3 | Subida firmada de fotos y videos con Cloudinary y validación de 30 s | **Código listo**; falta configurar Cloudinary y probar con archivos reales |
| 4 | Dominio, SEO (sitemap), revisión final | Pendiente |

Sin variables de entorno el sitio funciona con **datos de ejemplo**, así puedes
verlo de inmediato. Todo lo que está entre corchetes es un marcador.

## Probarlo en tu computador

```bash
npm install
npm run dev        # http://localhost:3000
```

## Conectarlo a Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. En **SQL Editor → New query**, pega todo `supabase/schema.sql` y ejecútalo.
   Se puede volver a ejecutar sin problema.
3. En **Authentication → Users → Add user**, crea tu usuario administrador
   (correo y contraseña). Luego, en **Authentication → Sign In / Providers**,
   desactiva los registros nuevos.
4. En el SQL Editor, autoriza ese usuario (con tu correo):
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'tu-correo@dominio.com';
   ```
5. Copia `.env.example` a `.env.local` y completa la URL y la clave `anon`
   (**Project Settings → API**).
6. Reinicia `npm run dev`. Edita la fila de `profile` en el **Table Editor**
   para poner nombre, profesión y datos de contacto.

## Panel de administración y carga de medios

1. Crea una cuenta en [Cloudinary](https://cloudinary.com/) y copia el **Cloud
   name**, **API Key** y **API Secret** desde el Dashboard.
2. Pega esos valores en `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y
   `CLOUDINARY_API_SECRET` dentro de `.env.local`. No agregues el prefijo
   `NEXT_PUBLIC_` ni compartas el API Secret.
3. Confirma que ejecutaste `supabase/schema.sql`, creaste el usuario en
   **Authentication → Users** y lo autorizaste en `public.admins`.
4. Reinicia `npm run dev` y abre `http://localhost:3000/admin`. Inicia sesión
   con ese usuario.
5. En **Galería**, prueba con fotos JPG, PNG o WebP (máximo 15 MB) y videos MP4
   o MOV (máximo 30 segundos y 100 MB). Los medios se guardan en Cloudinary y
   sus URL y metadatos en Supabase. Elige si quedan como borrador o públicos.

El API Secret solo se usa en rutas del servidor para firmar y verificar las
subidas; nunca se envía al navegador. El panel permite actualizar el perfil, agregar o quitar formación y logros,
registrar reuniones y cambiar su estado, y subir/publicar/ocultar/eliminar
fotos y videos.

## Publicarlo en Vercel

1. Sube el proyecto a un repositorio de GitHub e impórtalo en Vercel.
2. En **Settings → Environment Variables**, agrega las variables de
   `.env.example`, incluidas las tres credenciales privadas de Cloudinary (para
   producción usa tu dominio en `NEXT_PUBLIC_SITE_URL`). No subas `.env.local`
   al repositorio.
3. Para un dominio propio: **Settings → Domains → Add**. Vercel te muestra los
   registros DNS exactos que debes copiar en el sitio donde lo compraste.

> Vercel limita el plan gratuito (Hobby) a uso personal no comercial. Revisa
> sus [normas de uso justo](https://vercel.com/docs/limits/fair-use-guidelines)
> antes de publicar un sitio que promocione servicios.

## Que lo encuentren por el nombre ("Dr. Edwin Patiño")

El sitio ya trae lo que Google necesita: título con el nombre, direcciones
canónicas, `sitemap.xml`, `robots.txt` y datos estructurados de la persona (con
variantes como "Edwin Patino" y con o sin "Dr."). Mientras Supabase no esté
configurado, el sitio muestra datos de ejemplo y bloquea a los buscadores a
propósito.

Para lanzarlo con el dominio propio:

1. Compra el dominio **sin tilde ni ñ** (por ejemplo `edwinpatino.com`); así
   escribe la gente. Si quieres, compra también una variante (`dredwinpatino.com`)
   y haz que redirija a la principal.
2. En Supabase, en la fila de `profile`, escribe el nombre tal como se busca
   (`Dr. Edwin Patiño`), la profesión y las redes con enlace completo (`https://…`).
3. En Vercel → **Settings → Domains**, agrega el dominio (y su versión con `www`,
   redirigida a la principal).
4. Define `NEXT_PUBLIC_SITE_URL=https://tu-dominio.com` en Vercel y vuelve a
   desplegar. De ahí salen las direcciones canónicas, el sitemap y los datos
   estructurados.
5. En [Google Search Console](https://search.google.com/search-console) agrega el
   dominio, verifícalo (registro DNS TXT, o la etiqueta con
   `GOOGLE_SITE_VERIFICATION`) y envía `https://tu-dominio.com/sitemap.xml`.
6. Enlaza el sitio desde LinkedIn, Instagram, YouTube y las páginas de las
   universidades donde exista un perfil: esos enlaces ayudan a que Google
   reconozca el sitio como el de la persona.

Nadie puede garantizar el primer lugar: depende de si hay otras personas con el
mismo nombre y de cuánto tarde Google en rastrear el sitio, que puede ser de
días a semanas.

## Que Supabase gratis no se pause

Un proyecto gratuito de Supabase se pausa tras una semana sin actividad. La
ruta `/api/health` hace una consulta mínima a la base en cada visita: configura
un monitor (por ejemplo UptimeRobot) que la visite cada pocos minutos.

## Estructura

- `src/app/` — pestañas: `/`, `/formacion`, `/reuniones`, `/reuniones/[slug]`,
  `/logros`, `/galeria`, `/contacto`, y `/api/health`.
- `src/lib/data.ts` — lecturas públicas de Supabase con caché por etiquetas
  (`profile`, `education`, `meetings`, `achievements`, `media`).
- `src/lib/sample.ts` — datos de ejemplo mientras no hay Supabase.
- `supabase/schema.sql` — tablas, regla de máximo 30 s por video y permisos.

## Seguridad

- Las políticas RLS hacen que el público solo lea lo publicado; solo los
  usuarios listados en `public.admins` pueden escribir.
- La base rechaza videos de más de 30 s (`video_max_30s`), además de las
  validaciones en el navegador y el servidor que llegarán en la fase 3.
- El formulario de contacto tiene un campo trampa anti-spam, pero no limita la
  frecuencia de envíos; si llega spam, se añade un límite o un captcha.
