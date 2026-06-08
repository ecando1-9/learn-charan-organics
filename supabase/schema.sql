-- Charan Organics LMS schema
-- Uses lms_* names so it can safely live beside an existing ecommerce schema.

do $$
begin
  create type public.lms_user_role as enum ('student', 'instructor', 'admin');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.lms_course_level as enum ('beginner', 'intermediate', 'advanced');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.lms_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text not null,
  avatar_url text,
  role public.lms_user_role not null default 'student',
  suspended boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.lms_course_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.lms_courses (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.lms_course_categories(id),
  instructor_id uuid references public.lms_profiles(id),
  title text not null,
  slug text not null unique,
  description text not null,
  thumbnail_url text,
  price_inr integer not null default 0,
  is_free boolean not null default false,
  level public.lms_course_level not null default 'beginner',
  language text not null default 'English',
  duration_minutes integer not null default 0,
  published boolean not null default false,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lms_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.lms_courses(id) on delete cascade,
  title text not null,
  sort_order integer not null default 0
);

create table if not exists public.lms_lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.lms_modules(id) on delete cascade,
  title text not null,
  slug text not null,
  description text,
  sort_order integer not null default 0,
  is_preview boolean not null default false,
  published boolean not null default false,
  unique(module_id, slug)
);

create table if not exists public.lms_videos (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lms_lessons(id) on delete cascade,
  youtube_video_id text not null,
  duration_seconds integer,
  is_preview boolean not null default false
);

create table if not exists public.lms_pdf_resources (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references public.lms_lessons(id) on delete cascade,
  course_id uuid references public.lms_courses(id) on delete cascade,
  title text not null,
  storage_path text not null,
  downloadable boolean not null default true
);

create table if not exists public.lms_enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.lms_profiles(id) on delete cascade,
  course_id uuid not null references public.lms_courses(id) on delete cascade,
  status text not null default 'active',
  amount_paid_inr integer not null default 0,
  enrolled_at timestamptz not null default now(),
  unique(user_id, course_id)
);

create table if not exists public.lms_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.lms_profiles(id) on delete cascade,
  course_id uuid not null references public.lms_courses(id) on delete cascade,
  lesson_id uuid references public.lms_lessons(id) on delete cascade,
  video_watched_percent numeric not null default 0,
  completed boolean not null default false,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique(user_id, lesson_id)
);

create table if not exists public.lms_recently_watched (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.lms_profiles(id) on delete cascade,
  course_id uuid not null references public.lms_courses(id) on delete cascade,
  lesson_id uuid not null references public.lms_lessons(id) on delete cascade,
  watched_at timestamptz not null default now(),
  resume_seconds integer not null default 0,
  unique(user_id, lesson_id)
);

create table if not exists public.lms_comments (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lms_lessons(id) on delete cascade,
  user_id uuid not null references public.lms_profiles(id) on delete cascade,
  parent_id uuid references public.lms_comments(id) on delete cascade,
  body text not null,
  pinned boolean not null default false,
  reported boolean not null default false,
  likes_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.lms_reviews (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.lms_courses(id) on delete cascade,
  user_id uuid not null references public.lms_profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  body text,
  created_at timestamptz not null default now(),
  unique(course_id, user_id)
);

create table if not exists public.lms_certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.lms_profiles(id) on delete cascade,
  course_id uuid not null references public.lms_courses(id) on delete cascade,
  certificate_no text not null unique,
  issued_at timestamptz not null default now(),
  revoked_at timestamptz
);

create table if not exists public.lms_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.lms_profiles(id) on delete cascade,
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.lms_wishlist (
  user_id uuid not null references public.lms_profiles(id) on delete cascade,
  course_id uuid not null references public.lms_courses(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

alter table public.lms_profiles enable row level security;
alter table public.lms_course_categories enable row level security;
alter table public.lms_courses enable row level security;
alter table public.lms_modules enable row level security;
alter table public.lms_lessons enable row level security;
alter table public.lms_videos enable row level security;
alter table public.lms_pdf_resources enable row level security;
alter table public.lms_enrollments enable row level security;
alter table public.lms_progress enable row level security;
alter table public.lms_recently_watched enable row level security;
alter table public.lms_comments enable row level security;
alter table public.lms_reviews enable row level security;
alter table public.lms_certificates enable row level security;
alter table public.lms_notifications enable row level security;
alter table public.lms_wishlist enable row level security;

create or replace function public.lms_is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(
    select 1
    from public.lms_profiles
    where id = auth.uid()
      and role = 'admin'
      and suspended = false
  );
$$;

create or replace function public.lms_handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.lms_profiles (id, full_name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    coalesce(new.email, ''),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(public.lms_profiles.full_name, excluded.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.lms_profiles.avatar_url);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_lms_profile on auth.users;
create trigger on_auth_user_created_lms_profile
after insert on auth.users
for each row execute function public.lms_handle_new_user();

drop policy if exists "LMS public can read published courses" on public.lms_courses;
create policy "LMS public can read published courses"
on public.lms_courses for select
using (published = true or public.lms_is_admin());

drop policy if exists "LMS admins manage courses" on public.lms_courses;
create policy "LMS admins manage courses"
on public.lms_courses for all
using (public.lms_is_admin())
with check (public.lms_is_admin());

drop policy if exists "LMS users read own profile" on public.lms_profiles;
create policy "LMS users read own profile"
on public.lms_profiles for select
using (id = auth.uid() or public.lms_is_admin());

drop policy if exists "LMS users update own profile" on public.lms_profiles;
create policy "LMS users update own profile"
on public.lms_profiles for update
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "LMS admins manage profiles" on public.lms_profiles;
create policy "LMS admins manage profiles"
on public.lms_profiles for all
using (public.lms_is_admin())
with check (public.lms_is_admin());

drop policy if exists "LMS users read own enrollments" on public.lms_enrollments;
create policy "LMS users read own enrollments"
on public.lms_enrollments for select
using (user_id = auth.uid() or public.lms_is_admin());

drop policy if exists "LMS admins manage enrollments" on public.lms_enrollments;
create policy "LMS admins manage enrollments"
on public.lms_enrollments for all
using (public.lms_is_admin())
with check (public.lms_is_admin());

drop policy if exists "LMS users manage own progress" on public.lms_progress;
create policy "LMS users manage own progress"
on public.lms_progress for all
using (user_id = auth.uid() or public.lms_is_admin())
with check (user_id = auth.uid() or public.lms_is_admin());

drop policy if exists "LMS enrolled students read lessons" on public.lms_lessons;
create policy "LMS enrolled students read lessons"
on public.lms_lessons for select
using (published = true or public.lms_is_admin());

drop policy if exists "LMS enrolled students read resources" on public.lms_pdf_resources;
create policy "LMS enrolled students read resources"
on public.lms_pdf_resources for select
using (
  public.lms_is_admin()
  or exists (
    select 1
    from public.lms_enrollments e
    join public.lms_modules m on m.course_id = e.course_id
    join public.lms_lessons l on l.module_id = m.id
    where l.id = lms_pdf_resources.lesson_id
      and e.user_id = auth.uid()
      and e.status = 'active'
  )
);

drop policy if exists "LMS authenticated comments" on public.lms_comments;
create policy "LMS authenticated comments"
on public.lms_comments for select
using (auth.uid() is not null);

drop policy if exists "LMS users create comments" on public.lms_comments;
create policy "LMS users create comments"
on public.lms_comments for insert
with check (user_id = auth.uid());

drop policy if exists "LMS admins moderate comments" on public.lms_comments;
create policy "LMS admins moderate comments"
on public.lms_comments for all
using (public.lms_is_admin())
with check (public.lms_is_admin());
