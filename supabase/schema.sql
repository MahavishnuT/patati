-- ============================================================================
-- Patati — schéma Supabase
-- À exécuter une fois dans l'éditeur SQL de votre projet Supabase
-- (Dashboard → SQL Editor → New query → coller ce fichier → Run).
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- 1. Profils
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null,
  birthdate date,
  bio text default '',
  city text not null default 'Brussels',
  photo_url text,
  languages_spoken text[] not null default '{}',
  languages_learning text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_languages_spoken_idx on public.profiles using gin (languages_spoken);
create index if not exists profiles_languages_learning_idx on public.profiles using gin (languages_learning);

alter table public.profiles enable row level security;

-- Tout le monde connecté peut parcourir les profils (appli de rencontre publique).
create policy "profiles_select_all" on public.profiles
  for select using (auth.role() = 'authenticated');

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

create policy "profiles_delete_own" on public.profiles
  for delete using (auth.uid() = id);

-- Maintient updated_at à jour automatiquement.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 2. Demandes de match ("Proposer un match")
-- ----------------------------------------------------------------------------
create table if not exists public.match_requests (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid not null references public.profiles (id) on delete cascade,
  to_user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint match_requests_no_self check (from_user_id <> to_user_id),
  constraint match_requests_unique unique (from_user_id, to_user_id)
);

alter table public.match_requests enable row level security;

create policy "match_requests_select_own" on public.match_requests
  for select using (auth.uid() = from_user_id or auth.uid() = to_user_id);

create policy "match_requests_insert_own" on public.match_requests
  for insert with check (auth.uid() = from_user_id);

create policy "match_requests_delete_own" on public.match_requests
  for delete using (auth.uid() = from_user_id);

-- ----------------------------------------------------------------------------
-- 3. Matches mutuels (créés automatiquement quand les deux ont proposé)
-- ----------------------------------------------------------------------------
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  user_a_id uuid not null references public.profiles (id) on delete cascade,
  user_b_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint matches_ordered check (user_a_id < user_b_id),
  constraint matches_unique unique (user_a_id, user_b_id)
);

alter table public.matches enable row level security;

create policy "matches_select_own" on public.matches
  for select using (auth.uid() = user_a_id or auth.uid() = user_b_id);

-- Les matches ne sont jamais insérés directement par le client :
-- c'est le trigger ci-dessous (en tant que propriétaire de la table, donc RLS
-- ignoré) qui les crée dès qu'une demande devient réciproque.
create or replace function public.try_create_match()
returns trigger as $$
declare
  reciprocal_exists boolean;
  a uuid;
  b uuid;
begin
  select exists (
    select 1 from public.match_requests
    where from_user_id = new.to_user_id and to_user_id = new.from_user_id
  ) into reciprocal_exists;

  if reciprocal_exists then
    a := least(new.from_user_id, new.to_user_id);
    b := greatest(new.from_user_id, new.to_user_id);
    insert into public.matches (user_a_id, user_b_id)
    values (a, b)
    on conflict (user_a_id, user_b_id) do nothing;
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists match_requests_try_create_match on public.match_requests;
create trigger match_requests_try_create_match
  after insert on public.match_requests
  for each row execute function public.try_create_match();

-- ----------------------------------------------------------------------------
-- 4. Messages (chat texte simple par match)
-- ----------------------------------------------------------------------------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  content text not null check (char_length(content) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists messages_match_id_idx on public.messages (match_id, created_at);

alter table public.messages enable row level security;

create policy "messages_select_in_own_match" on public.messages
  for select using (
    exists (
      select 1 from public.matches m
      where m.id = messages.match_id
        and (m.user_a_id = auth.uid() or m.user_b_id = auth.uid())
    )
  );

create policy "messages_insert_in_own_match" on public.messages
  for insert with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.matches m
      where m.id = messages.match_id
        and (m.user_a_id = auth.uid() or m.user_b_id = auth.uid())
    )
  );

-- Active le Realtime (INSERT) sur messages et matches pour le chat live.
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.matches;

-- ----------------------------------------------------------------------------
-- 5. Fonction de matching : profils compatibles avec l'utilisateur courant
--    Compatible = (l'autre veut apprendre une langue que je parle)
--             ET (l'autre parle une langue que je veux apprendre)
--    Exclut : moi-même, les profils déjà proposés, les profils déjà matchés.
-- ----------------------------------------------------------------------------
create or replace function public.get_compatible_profiles(current_user_id uuid)
returns setof public.profiles as $$
  select p.*
  from public.profiles p
  join public.profiles me on me.id = current_user_id
  where p.id <> current_user_id
    and p.languages_learning && me.languages_spoken
    and p.languages_spoken && me.languages_learning
    and not exists (
      select 1 from public.match_requests mr
      where mr.from_user_id = current_user_id and mr.to_user_id = p.id
    )
    and not exists (
      select 1 from public.matches m
      where (m.user_a_id = current_user_id and m.user_b_id = p.id)
         or (m.user_b_id = current_user_id and m.user_a_id = p.id)
    );
$$ language sql stable security definer;

-- ----------------------------------------------------------------------------
-- 6. Stockage des photos de profil
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatar_public_read" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "avatar_owner_write" on storage.objects
  for insert with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "avatar_owner_update" on storage.objects
  for update using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "avatar_owner_delete" on storage.objects
  for delete using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
