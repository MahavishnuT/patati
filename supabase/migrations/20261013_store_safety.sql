-- Apply after supabase/schema.sql on existing projects.

create or replace function public.enforce_adult_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  birth_date date;
begin
  if tg_op = 'UPDATE'
     and new.raw_user_meta_data ->> 'birthdate' is not distinct from old.raw_user_meta_data ->> 'birthdate' then
    return new;
  end if;

  begin
    birth_date := (new.raw_user_meta_data ->> 'birthdate')::date;
  exception
    when invalid_datetime_format or datetime_field_overflow then
      raise exception 'A valid date of birth is required.';
  end;

  if birth_date is null or birth_date > (current_date - interval '18 years')::date then
    raise exception 'Babbelr is only available to people aged 18 or over.';
  end if;

  return new;
end;
$$;

drop trigger if exists auth_users_enforce_adult on auth.users;
create trigger auth_users_enforce_adult
  before insert or update on auth.users
  for each row execute function public.enforce_adult_auth_user();

create or replace function public.is_adult(user_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  birth_date date;
begin
  select (u.raw_user_meta_data ->> 'birthdate')::date
  into birth_date
  from auth.users u
  where u.id = user_id;

  return birth_date is not null
    and birth_date <= (current_date - interval '18 years')::date;
exception
  when invalid_datetime_format or datetime_field_overflow then
    return false;
end;
$$;

alter table public.profiles drop column if exists birthdate;
alter table public.profiles
  add column if not exists moderation_status text not null default 'pending'
    check (moderation_status in ('pending', 'approved', 'rejected'));

create table if not exists public.user_blocks (
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint user_blocks_no_self check (blocker_id <> blocked_id)
);

create or replace function public.is_blocked_between(first_user_id uuid, second_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    auth.uid() in (first_user_id, second_user_id)
    and exists (
      select 1 from public.user_blocks ub
      where (ub.blocker_id = first_user_id and ub.blocked_id = second_user_id)
         or (ub.blocker_id = second_user_id and ub.blocked_id = first_user_id)
    ),
    false
  );
$$;

create or replace function public.can_access_match(requested_match_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.matches m
    join public.profiles a on a.id = m.user_a_id
    join public.profiles b on b.id = m.user_b_id
    where m.id = requested_match_id
      and auth.uid() in (m.user_a_id, m.user_b_id)
      and a.moderation_status = 'approved'
      and b.moderation_status = 'approved'
      and public.is_adult(a.id)
      and public.is_adult(b.id)
      and not public.is_blocked_between(m.user_a_id, m.user_b_id)
  );
$$;

alter table public.user_blocks enable row level security;
drop policy if exists "user_blocks_select_own" on public.user_blocks;
create policy "user_blocks_select_own" on public.user_blocks
  for select using (auth.uid() = blocker_id);
drop policy if exists "user_blocks_insert_own" on public.user_blocks;
create policy "user_blocks_insert_own" on public.user_blocks
  for insert with check (auth.uid() = blocker_id);
drop policy if exists "user_blocks_update_own" on public.user_blocks;
create policy "user_blocks_update_own" on public.user_blocks
  for update using (auth.uid() = blocker_id)
  with check (auth.uid() = blocker_id);
drop policy if exists "user_blocks_delete_own" on public.user_blocks;
create policy "user_blocks_delete_own" on public.user_blocks
  for delete using (auth.uid() = blocker_id);

create table if not exists public.content_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reported_user_id uuid references public.profiles (id) on delete set null,
  match_id uuid references public.matches (id) on delete set null,
  message_id uuid references public.messages (id) on delete set null,
  reason text not null check (reason in (
    'inappropriate_profile',
    'harassment',
    'spam',
    'sexual_content',
    'underage',
    'other'
  )),
  reported_content text check (char_length(reported_content) <= 2000),
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  created_at timestamptz not null default now(),
  constraint content_reports_not_self check (reporter_id <> reported_user_id),
  constraint content_reports_message_context check (message_id is null or match_id is not null)
);

create unique index if not exists content_reports_profile_once_idx
  on public.content_reports (reporter_id, reported_user_id)
  where message_id is null;
create unique index if not exists content_reports_message_once_idx
  on public.content_reports (reporter_id, message_id)
  where message_id is not null;

update storage.buckets set public = false where id = 'avatars';
drop policy if exists "avatar_public_read" on storage.objects;
drop policy if exists "avatar_authenticated_read_approved" on storage.objects;
create policy "avatar_authenticated_read_approved" on storage.objects
  for select to authenticated using (
    bucket_id = 'avatars'
    and exists (
      select 1
      from public.profiles p
      where p.id::text = (storage.foldername(name))[1]
        and (
          p.id = auth.uid()
          or (
            p.moderation_status = 'approved'
            and public.is_adult(p.id)
            and not public.is_blocked_between(auth.uid(), p.id)
          )
        )
    )
  );

alter table public.content_reports enable row level security;
drop policy if exists "content_reports_insert_own" on public.content_reports;
create policy "content_reports_insert_own" on public.content_reports
  for insert with check (
    auth.uid() = reporter_id
    and reported_user_id is not null
    and reporter_id <> reported_user_id
    and exists (
      select 1 from public.profiles target
      where target.id = content_reports.reported_user_id
    )
    and (
      (match_id is null and message_id is null)
      or exists (
        select 1
        from public.matches m
        where m.id = content_reports.match_id
          and public.can_access_match(m.id)
          and (
            (m.user_a_id = reporter_id and m.user_b_id = reported_user_id)
            or (m.user_b_id = reporter_id and m.user_a_id = reported_user_id)
          )
      )
    )
    and (
      message_id is null
      or exists (
        select 1 from public.messages msg
        where msg.id = content_reports.message_id
          and msg.match_id = content_reports.match_id
          and msg.sender_id = content_reports.reported_user_id
      )
    )
  );

create or replace function public.protect_profile_moderation_status()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if auth.uid() is null then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.moderation_status := 'pending';
    return new;
  end if;

  if new.first_name is distinct from old.first_name
     or new.bio is distinct from old.bio
     or new.photo_url is distinct from old.photo_url
     or new.languages_spoken is distinct from old.languages_spoken
     or new.languages_learning is distinct from old.languages_learning then
    new.moderation_status := 'pending';
  elsif new.moderation_status is distinct from old.moderation_status then
    raise exception 'Profile moderation status can only be changed by a moderator.';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_protect_moderation_status on public.profiles;
create trigger profiles_protect_moderation_status
  before insert or update on public.profiles
  for each row execute function public.protect_profile_moderation_status();

drop policy if exists "profiles_select_all" on public.profiles;
drop policy if exists "profiles_select_safe" on public.profiles;
create policy "profiles_select_safe" on public.profiles
  for select using (
    auth.uid() = id
    or (
      moderation_status = 'approved'
      and public.is_adult(id)
      and not public.is_blocked_between(auth.uid(), id)
    )
  );

drop policy if exists "match_requests_insert_own" on public.match_requests;
create policy "match_requests_insert_own" on public.match_requests
  for insert with check (
    auth.uid() = from_user_id
    and exists (
      select 1 from public.profiles me
      join public.profiles target on target.id = to_user_id
      where me.id = from_user_id
        and me.moderation_status = 'approved'
        and target.moderation_status = 'approved'
        and public.is_adult(me.id)
        and public.is_adult(target.id)
    )
    and not public.is_blocked_between(from_user_id, to_user_id)
  );

drop policy if exists "matches_select_own" on public.matches;
create policy "matches_select_own" on public.matches
  for select using (public.can_access_match(id));

drop policy if exists "messages_select_in_own_match" on public.messages;
create policy "messages_select_in_own_match" on public.messages
  for select using (public.can_access_match(match_id));
drop policy if exists "messages_insert_in_own_match" on public.messages;
create policy "messages_insert_in_own_match" on public.messages
  for insert with check (
    auth.uid() = sender_id
    and public.can_access_match(match_id)
  );

create or replace function public.get_compatible_profiles(current_user_id uuid)
returns setof public.profiles
language sql
stable
security definer
set search_path = ''
as $$
  select p.*
  from public.profiles p
  join public.profiles me on me.id = current_user_id
  where auth.uid() = current_user_id
    and me.moderation_status = 'approved'
    and p.moderation_status = 'approved'
    and public.is_adult(me.id)
    and public.is_adult(p.id)
    and p.id <> current_user_id
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
    )
    and not public.is_blocked_between(current_user_id, p.id);
$$;

grant execute on function public.is_adult(uuid) to authenticated;
grant execute on function public.is_blocked_between(uuid, uuid) to authenticated;
grant execute on function public.can_access_match(uuid) to authenticated;
