create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);
alter table public.admins enable row level security;
-- Sin políticas: nadie puede leer ni escribir esta tabla directamente.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

.
create table if not exists public.profile (
  id boolean primary key default true check (id),
  full_name text not null default '',
  profession text not null default '',
  headline text not null default '',
  bio text not null default '',
  email text not null default '',
  phone text not null default '',
  location text not null default '',
  photo_url text not null default '',
  linkedin text not null default '',
  instagram text not null default '',
  youtube text not null default '',
  whatsapp text not null default '',
  career_start_year int,
  updated_at timestamptz not null default now()
);

create table if not exists public.education (
  id uuid primary key default gen_random_uuid(),
  level text not null
    check (level in ('pregrado', 'especializacion', 'maestria', 'doctorado')),
  program text not null,
  university text not null,
  year int,
  description text not null default '',
  logo_url text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.meetings (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  meeting_date date not null,
  kind text not null default 'trabajo'
    check (kind in ('trabajo', 'audiencia', 'charla', 'otro')),
  place text not null default '',
  context text not null default '',
  actions text not null default '',
  result text not null default '',
  status text not null default 'borrador'
    check (status in ('publica', 'oculta', 'borrador')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists meetings_date_idx
  on public.meetings (meeting_date desc);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  year int,
  description text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);


create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid references public.meetings (id) on delete cascade,
  kind text not null check (kind in ('foto', 'video')),
  url text not null,
  thumb_url text not null default '',
  public_id text not null default '',
  duration_seconds numeric(6, 2),
  caption text not null default '',
  sort_order int not null default 0,
  status text not null default 'publica'
    check (status in ('publica', 'oculta', 'borrador')),
  created_at timestamptz not null default now(),

  constraint video_duration_30_to_90s check (
    kind <> 'video'
    or (duration_seconds is not null
        and duration_seconds >= 30
        and duration_seconds <= 90)
  )
);
alter table public.media drop constraint if exists video_max_30s;
alter table public.media drop constraint if exists video_duration_30_to_90s;
alter table public.media add constraint video_duration_30_to_90s check (
  kind <> 'video'
  or (duration_seconds is not null
      and duration_seconds >= 30
      and duration_seconds <= 90)
);
create index if not exists media_meeting_idx on public.media (meeting_id);

-- Mensajes del formulario de contacto.
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now(),
  constraint messages_len check (
    char_length(name) between 1 and 120
    and char_length(email) between 3 and 200
    and char_length(message) between 1 and 4000
  )
);


create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profile_updated_at on public.profile;
create trigger profile_updated_at before update on public.profile
  for each row execute function public.set_updated_at();

drop trigger if exists meetings_updated_at on public.meetings;
create trigger meetings_updated_at before update on public.meetings
  for each row execute function public.set_updated_at();


alter table public.profile      enable row level security;
alter table public.education    enable row level security;
alter table public.meetings     enable row level security;
alter table public.achievements enable row level security;
alter table public.media        enable row level security;
alter table public.messages     enable row level security;

-- Perfil, formación y logros: lectura pública, escritura de admin.
drop policy if exists "profile lectura" on public.profile;
create policy "profile lectura" on public.profile
  for select to anon, authenticated using (true);
drop policy if exists "profile admin" on public.profile;
create policy "profile admin" on public.profile
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "education lectura" on public.education;
create policy "education lectura" on public.education
  for select to anon, authenticated using (true);
drop policy if exists "education admin" on public.education;
create policy "education admin" on public.education
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "achievements lectura" on public.achievements;
create policy "achievements lectura" on public.achievements
  for select to anon, authenticated using (true);
drop policy if exists "achievements admin" on public.achievements;
create policy "achievements admin" on public.achievements
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));


drop policy if exists "meetings lectura" on public.meetings;
create policy "meetings lectura" on public.meetings
  for select to anon, authenticated
  using (status = 'publica' or (select public.is_admin()));
drop policy if exists "meetings admin" on public.meetings;
create policy "meetings admin" on public.meetings
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));


drop policy if exists "media lectura" on public.media;
create policy "media lectura" on public.media
  for select to anon, authenticated
  using (
    (select public.is_admin())
    or (
      status = 'publica'
      and (
        meeting_id is null
        or exists (
          select 1 from public.meetings m
          where m.id = media.meeting_id and m.status = 'publica'
        )
      )
    )
  );
drop policy if exists "media admin" on public.media;
create policy "media admin" on public.media
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "messages enviar" on public.messages;
create policy "messages enviar" on public.messages
  for insert to anon, authenticated with check (true);
drop policy if exists "messages admin" on public.messages;
create policy "messages admin" on public.messages
  for select to authenticated using ((select public.is_admin()));
drop policy if exists "messages admin update" on public.messages;
create policy "messages admin update" on public.messages
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "messages admin delete" on public.messages;
create policy "messages admin delete" on public.messages
  for delete to authenticated using ((select public.is_admin()));

-- Privilegios de tabla (RLS decide después qué filas se pueden tocar).
grant select on public.profile, public.education, public.achievements,
  public.meetings, public.media to anon, authenticated;
grant insert, update, delete on public.profile, public.education,
  public.achievements, public.meetings, public.media to authenticated;
grant insert on public.messages to anon, authenticated;
grant select, update, delete on public.messages to authenticated;


insert into public.profile (full_name, profession, location)
values ('[Nombre Apellido]', '[Profesión]', 'Buenaventura, Valle del Cauca')
on conflict (id) do nothing;
