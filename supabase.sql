-- Hugo Monroux · Training Lab
-- Cuentas sencillas con usuario + PIN. Pega TODO este archivo en Supabase → SQL Editor → Run.
-- La tabla no se puede leer desde la web: solo se accede a través de las funciones de abajo,
-- que comprueban el PIN (guardado cifrado con bcrypt) y bloquean 15 min tras 5 fallos.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.perfiles (
  usuario          text primary key check (usuario ~ '^[a-z0-9_.-]{3,20}$'),
  pin_hash         text not null,
  datos            jsonb,
  actualizado      timestamptz not null default now(),
  creado           timestamptz not null default now(),
  intentos         int not null default 0,
  bloqueado_hasta  timestamptz
);

-- RLS activado y sin políticas: nadie puede leer ni escribir la tabla directamente.
alter table public.perfiles enable row level security;
revoke all on public.perfiles from anon, authenticated;

-- Comprueba usuario + PIN. Devuelve null si es correcto o el mensaje de error.
-- No lanza excepciones para que el contador de intentos fallidos sí se guarde.
create or replace function public._verificar(p_usuario text, p_pin text)
returns text
language plpgsql security definer
set search_path = public, extensions
as $$
declare r public.perfiles;
begin
  select * into r from public.perfiles where usuario = lower(trim(p_usuario)) for update;
  if not found then return 'Usuario o PIN incorrectos'; end if;
  if r.bloqueado_hasta is not null and r.bloqueado_hasta > now() then
    return 'Demasiados intentos fallidos. Espera unos minutos y vuelve a probar';
  end if;
  if r.pin_hash <> crypt(coalesce(p_pin, ''), r.pin_hash) then
    update public.perfiles
       set intentos = intentos + 1,
           bloqueado_hasta = case when intentos + 1 >= 5 then now() + interval '15 minutes' else null end
     where usuario = r.usuario;
    return 'Usuario o PIN incorrectos';
  end if;
  update public.perfiles set intentos = 0, bloqueado_hasta = null where usuario = r.usuario;
  return null;
end $$;

create or replace function public.registrar(p_usuario text, p_pin text, p_datos jsonb)
returns jsonb
language plpgsql security definer
set search_path = public, extensions
as $$
declare u text := lower(trim(p_usuario)); t timestamptz := now();
begin
  if u !~ '^[a-z0-9_.-]{3,20}$' then
    return jsonb_build_object('ok', false, 'error', 'El usuario debe tener 3–20 caracteres: letras, números, punto, guion o guion bajo');
  end if;
  if coalesce(p_pin, '') !~ '^[0-9]{4,6}$' then
    return jsonb_build_object('ok', false, 'error', 'El PIN debe tener entre 4 y 6 números');
  end if;
  if exists (select 1 from public.perfiles where usuario = u) then
    return jsonb_build_object('ok', false, 'error', 'Ese usuario ya existe');
  end if;
  insert into public.perfiles (usuario, pin_hash, datos, actualizado)
  values (u, crypt(p_pin, gen_salt('bf')), p_datos, t);
  return jsonb_build_object('ok', true, 'usuario', u, 'actualizado', t);
end $$;

create or replace function public.entrar(p_usuario text, p_pin text)
returns jsonb
language plpgsql security definer
set search_path = public, extensions
as $$
declare err text; r public.perfiles;
begin
  err := public._verificar(p_usuario, p_pin);
  if err is not null then return jsonb_build_object('ok', false, 'error', err); end if;
  select * into r from public.perfiles where usuario = lower(trim(p_usuario));
  return jsonb_build_object('ok', true, 'usuario', r.usuario, 'datos', r.datos, 'actualizado', r.actualizado);
end $$;

create or replace function public.guardar(p_usuario text, p_pin text, p_datos jsonb)
returns jsonb
language plpgsql security definer
set search_path = public, extensions
as $$
declare err text; t timestamptz := now();
begin
  err := public._verificar(p_usuario, p_pin);
  if err is not null then return jsonb_build_object('ok', false, 'error', err); end if;
  update public.perfiles set datos = p_datos, actualizado = t where usuario = lower(trim(p_usuario));
  return jsonb_build_object('ok', true, 'actualizado', t);
end $$;

-- Solo las tres funciones públicas se pueden llamar desde la web.
revoke all on function public._verificar(text, text) from public, anon, authenticated;
revoke all on function public.registrar(text, text, jsonb) from public;
revoke all on function public.entrar(text, text) from public;
revoke all on function public.guardar(text, text, jsonb) from public;
grant execute on function public.registrar(text, text, jsonb) to anon, authenticated;
grant execute on function public.entrar(text, text) to anon, authenticated;
grant execute on function public.guardar(text, text, jsonb) to anon, authenticated;
