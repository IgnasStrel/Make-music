-- MUSICATION teacher module - database schema for Supabase.
--
-- Run it once in the Supabase dashboard: SQL Editor -> paste -> Run.
-- It is safe to run again after changes (everything is "if not exists" /
-- "create or replace" / "drop policy if exists").
--
-- Who can do what (spec section 18):
--   * A teacher (Supabase Auth, email + password) sees and changes only
--     their own classes, students, lessons, assignments and results.
--   * Program lessons are not stored here at all: they live in the app
--     (programLessons.js), so a teacher can never overwrite them - only
--     copy them (lessons.source_lesson_id remembers the original).
--   * A student has no email account: the teacher gives each student a
--     login code. Students never read the tables directly; they only call
--     the student_* functions below, which check the code and show the
--     student nothing but their own tasks.

create extension if not exists pgcrypto;

-- ───────────────────────────── Tables ─────────────────────────────

create table if not exists public.teachers (
  id          uuid primary key references auth.users on delete cascade,
  name        text not null default '',
  email       text,
  language    text not null default 'lt',
  settings    jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

create table if not exists public.classes (
  id          uuid primary key default gen_random_uuid(),
  teacher_id  uuid not null references public.teachers on delete cascade,
  name        text not null,
  created_at  timestamptz not null default now()
);

-- A login code: 8 characters without look-alikes (0/O, 1/I). Security
-- definer so the "is it free?" check sees every teacher's students.
create or replace function public.new_login_code() returns text
language plpgsql volatile security definer set search_path = public, extensions as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';   -- 32 characters
  code text;
begin
  loop
    code := '';
    for i in 1..8 loop
      code := code || substr(alphabet, 1 + (get_byte(gen_random_bytes(1), 0) % 32), 1);
    end loop;
    exit when not exists (select 1 from public.students s where s.login_code = code);
  end loop;
  return code;
end $$;

create table if not exists public.students (
  id              uuid primary key default gen_random_uuid(),
  teacher_id      uuid not null references public.teachers on delete cascade,
  class_id        uuid references public.classes on delete set null,
  name            text not null,
  login_code      text not null unique,
  remote_enabled  boolean not null default false,   -- may work from home
  last_seen       timestamptz,
  seen_from       text,                              -- 'class' | 'home'
  created_at      timestamptz not null default now()
);
alter table public.students alter column login_code set default public.new_login_code();

create table if not exists public.lessons (
  id                uuid primary key default gen_random_uuid(),
  author_id         uuid not null references public.teachers on delete cascade,
  title             text not null,
  title_en          text,
  grade             text,
  topic             text,
  difficulty        int,
  duration          int,            -- minutes
  order_mode        text not null default 'fixed',   -- 'fixed' | 'free'
  color_mode        text not null default 'color',   -- 'color' | 'plain'
  language          text not null default 'lt',
  source_lesson_id  text,           -- 'program:…' or another lesson's id
  version           int not null default 1,
  blocks            jsonb not null default '[]',     -- [{id, type, order, content, settings}]
  archived          boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table if not exists public.lesson_versions (
  id          uuid primary key default gen_random_uuid(),
  lesson_id   uuid not null references public.lessons on delete cascade,
  version     int not null,
  title       text,
  settings    jsonb not null default '{}',
  blocks      jsonb not null,
  note        text,
  created_at  timestamptz not null default now(),
  created_by  uuid references public.teachers on delete set null,
  unique (lesson_id, version)
);

-- An assignment carries its own copy of the blocks, so it does not depend
-- on the lesson (spec 17.1): one block can go to one student, and later
-- edits of the lesson do not change a task already given.
create table if not exists public.assignments (
  id                 uuid primary key default gen_random_uuid(),
  teacher_id         uuid not null references public.teachers on delete cascade,
  lesson_id          uuid references public.lessons on delete set null,
  program_lesson_id  text,
  block_ids          text[],          -- null = the whole lesson
  title              text not null,
  content            jsonb not null,  -- the blocks to do
  remote             boolean not null default false,
  assigned_at        timestamptz not null default now(),
  due_at             timestamptz
);

create table if not exists public.assignment_students (
  assignment_id  uuid not null references public.assignments on delete cascade,
  student_id     uuid not null references public.students on delete cascade,
  status         text not null default 'assigned',  -- assigned|started|in_progress|completed|repeat
  updated_at     timestamptz not null default now(),
  primary key (assignment_id, student_id)
);

-- Only work a connected student really did on their own (spec 13).
create table if not exists public.attempts (
  id             uuid primary key default gen_random_uuid(),
  assignment_id  uuid not null references public.assignments on delete cascade,
  student_id     uuid not null references public.students on delete cascade,
  block_id       text,
  area           text,               -- notes|rhythm|listening|piano|other
  started_at     timestamptz,
  completed_at   timestamptz not null default now(),
  score          numeric,            -- 0..1
  errors         jsonb not null default '[]'   -- where it went wrong: note, beat, choice…
);

create index if not exists students_teacher_idx on public.students (teacher_id);
create index if not exists lessons_author_idx on public.lessons (author_id);
create index if not exists assignments_teacher_idx on public.assignments (teacher_id);
create index if not exists attempts_student_idx on public.attempts (student_id);

-- A teacher row for every new account.
create or replace function public.handle_new_teacher() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.teachers (id, email, name, language)
  values (new.id, new.email,
          coalesce(new.raw_user_meta_data ->> 'name', ''),
          coalesce(new.raw_user_meta_data ->> 'language', 'lt'))
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_teacher();

-- ───────────────────────────── Row-level security ─────────────────────────────

alter table public.teachers            enable row level security;
alter table public.classes             enable row level security;
alter table public.students            enable row level security;
alter table public.lessons             enable row level security;
alter table public.lesson_versions     enable row level security;
alter table public.assignments         enable row level security;
alter table public.assignment_students enable row level security;
alter table public.attempts            enable row level security;

drop policy if exists "own profile" on public.teachers;
create policy "own profile" on public.teachers for select using (id = auth.uid());
drop policy if exists "own profile update" on public.teachers;
create policy "own profile update" on public.teachers for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "own classes" on public.classes;
create policy "own classes" on public.classes for all
  using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());

drop policy if exists "own students" on public.students;
create policy "own students" on public.students for all
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid() and (class_id is null or exists (
    select 1 from public.classes c where c.id = class_id and c.teacher_id = auth.uid())));

drop policy if exists "own lessons" on public.lessons;
create policy "own lessons" on public.lessons for all
  using (author_id = auth.uid()) with check (author_id = auth.uid());

drop policy if exists "own lesson versions" on public.lesson_versions;
create policy "own lesson versions" on public.lesson_versions for all
  using (exists (select 1 from public.lessons l where l.id = lesson_id and l.author_id = auth.uid()))
  with check (exists (select 1 from public.lessons l where l.id = lesson_id and l.author_id = auth.uid()));

drop policy if exists "own assignments" on public.assignments;
create policy "own assignments" on public.assignments for all
  using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());

drop policy if exists "own assignment students" on public.assignment_students;
create policy "own assignment students" on public.assignment_students for all
  using (exists (select 1 from public.assignments a where a.id = assignment_id and a.teacher_id = auth.uid()))
  with check (
    exists (select 1 from public.assignments a where a.id = assignment_id and a.teacher_id = auth.uid())
    and exists (select 1 from public.students s where s.id = student_id and s.teacher_id = auth.uid()));

drop policy if exists "own results" on public.attempts;
create policy "own results" on public.attempts for select
  using (exists (select 1 from public.assignments a where a.id = assignment_id and a.teacher_id = auth.uid()));
drop policy if exists "own results delete" on public.attempts;
create policy "own results delete" on public.attempts for delete
  using (exists (select 1 from public.assignments a where a.id = assignment_id and a.teacher_id = auth.uid()));

-- ───────────────────────────── Students (by login code) ─────────────────────────────

-- Find the student behind a code; p_where 'home' needs remote work allowed.
create or replace function public.student_login(p_code text, p_where text default 'class')
returns json language plpgsql security definer set search_path = public as $$
declare s public.students;
begin
  select * into s from public.students where login_code = upper(trim(p_code));
  if not found then return json_build_object('error', 'bad_code'); end if;
  if p_where = 'home' and not s.remote_enabled then
    return json_build_object('error', 'remote_disabled');
  end if;
  update public.students
     set last_seen = now(), seen_from = case when p_where = 'home' then 'home' else 'class' end
   where id = s.id;
  return json_build_object('id', s.id, 'name', s.name, 'remote', s.remote_enabled,
    'teacher', (select t.name from public.teachers t where t.id = s.teacher_id));
end $$;

-- The student's tasks (newest first). Also tells the teacher "I'm here".
create or replace function public.student_tasks(p_code text, p_where text default 'class')
returns json language plpgsql security definer set search_path = public as $$
declare sid uuid;
begin
  select id into sid from public.students where login_code = upper(trim(p_code))
    and (p_where <> 'home' or remote_enabled);
  if sid is null then return null; end if;
  update public.students
     set last_seen = now(), seen_from = case when p_where = 'home' then 'home' else 'class' end
   where id = sid;
  return coalesce((
    select json_agg(json_build_object(
             'id', a.id, 'title', a.title, 'content', a.content,
             'assigned_at', a.assigned_at, 'due_at', a.due_at, 'status', x.status)
           order by a.assigned_at desc)
      from public.assignment_students x
      join public.assignments a on a.id = x.assignment_id
     where x.student_id = sid), '[]'::json);
end $$;

-- started / in_progress, set by the student's screen.
create or replace function public.student_set_status(p_code text, p_assignment uuid, p_status text)
returns boolean language plpgsql security definer set search_path = public as $$
declare sid uuid;
begin
  if p_status not in ('started', 'in_progress') then return false; end if;
  select id into sid from public.students where login_code = upper(trim(p_code));
  if sid is null then return false; end if;
  update public.assignment_students set status = p_status, updated_at = now()
   where assignment_id = p_assignment and student_id = sid and status <> 'completed';
  return found;
end $$;

-- One finished block. p_last = the whole task is done: it becomes
-- "completed", or "repeat" when the task's average stays under 60 %.
create or replace function public.student_submit(
  p_code text, p_assignment uuid, p_block text, p_area text,
  p_score numeric, p_errors jsonb, p_started timestamptz, p_last boolean)
returns text language plpgsql security definer set search_path = public as $$
declare sid uuid; avg_score numeric; new_status text;
begin
  select id into sid from public.students where login_code = upper(trim(p_code));
  if sid is null then return null; end if;
  if not exists (select 1 from public.assignment_students
                  where assignment_id = p_assignment and student_id = sid) then
    return null;
  end if;
  if p_score is not null then
    insert into public.attempts (assignment_id, student_id, block_id, area, started_at, score, errors)
    values (p_assignment, sid, p_block, p_area, p_started,
            greatest(0, least(1, p_score)), coalesce(p_errors, '[]'::jsonb));
  end if;
  if p_last then
    -- The newest attempt of each block: an old weak try does not keep a
    -- task on "repeat" once the child has done it again.
    select avg(score) into avg_score from (
      select distinct on (coalesce(block_id, '')) score from public.attempts
       where assignment_id = p_assignment and student_id = sid
       order by coalesce(block_id, ''), completed_at desc) latest;
    new_status := case when avg_score is not null and avg_score < 0.6 then 'repeat' else 'completed' end;
  else
    new_status := 'in_progress';
  end if;
  update public.assignment_students set status = new_status, updated_at = now()
   where assignment_id = p_assignment and student_id = sid;
  return new_status;
end $$;

revoke all on function public.new_login_code() from public, anon;
grant execute on function public.new_login_code() to authenticated;
revoke all on function public.student_login(text, text) from public;
revoke all on function public.student_tasks(text, text) from public;
revoke all on function public.student_set_status(text, uuid, text) from public;
revoke all on function public.student_submit(text, uuid, text, text, numeric, jsonb, timestamptz, boolean) from public;
grant execute on function public.student_login(text, text) to anon, authenticated;
grant execute on function public.student_tasks(text, text) to anon, authenticated;
grant execute on function public.student_set_status(text, uuid, text) to anon, authenticated;
grant execute on function public.student_submit(text, uuid, text, text, numeric, jsonb, timestamptz, boolean) to anon, authenticated;

-- ───────────────────────────── Files for lessons ─────────────────────────────
-- Pictures, sound and video a teacher adds to a lesson. Anyone with the
-- link can view them (students too); a teacher writes only to their own
-- folder (<teacher id>/…).

insert into storage.buckets (id, name, public)
values ('lesson-media', 'lesson-media', true)
on conflict (id) do nothing;

drop policy if exists "teacher uploads own media" on storage.objects;
create policy "teacher uploads own media" on storage.objects for insert to authenticated
  with check (bucket_id = 'lesson-media' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "teacher deletes own media" on storage.objects;
create policy "teacher deletes own media" on storage.objects for delete to authenticated
  using (bucket_id = 'lesson-media' and (storage.foldername(name))[1] = auth.uid()::text);
