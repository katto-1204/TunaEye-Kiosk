create type public.app_role as enum ('grader', 'admin');
create type public.client_source as enum ('kiosk', 'mobile');
create type public.sample_type as enum ('sashibo_core', 'tail_cut');
create type public.tuna_grade as enum ('A', 'B', 'C', 'Invalid');

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'grader',
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.grading_records (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete restrict,
  source public.client_source not null,
  station_id text,
  session_id text not null,
  grader_name text not null,
  sample_type public.sample_type not null,
  fish_id text not null,
  weight_kg numeric(8,2),
  grade public.tuna_grade not null,
  confidence numeric(5,2) check (confidence is null or confidence between 0 and 100),
  result_status text not null,
  original_grade public.tuna_grade,
  override_grade public.tuna_grade,
  override_reason text,
  image_path text,
  gradcam_path text,
  captured_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index grading_records_user_captured_idx on public.grading_records (user_id, captured_at desc);
create index grading_records_session_idx on public.grading_records (session_id);
create index grading_records_source_idx on public.grading_records (source);

alter table public.profiles enable row level security;
alter table public.grading_records enable row level security;

create policy "profiles read own" on public.profiles for select to authenticated using (user_id = auth.uid());
create policy "profiles update own" on public.profiles for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
revoke update on public.profiles from authenticated;
grant update (display_name, updated_at) on public.profiles to authenticated;

create policy "records insert own" on public.grading_records for insert to authenticated with check (user_id = auth.uid());
create policy "records update own" on public.grading_records for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "records read own or admin" on public.grading_records for select to authenticated using (
  user_id = auth.uid() or exists (select 1 from public.profiles where user_id = auth.uid() and role = 'admin')
);

create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (user_id, display_name) values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', 'TunaEye user'));
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

insert into storage.buckets (id, name, public) values ('grading-images', 'grading-images', false)
on conflict (id) do update set public = excluded.public;

create policy "grading images insert own" on storage.objects for insert to authenticated with check (
  bucket_id = 'grading-images' and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "grading images update own" on storage.objects for update to authenticated using (
  bucket_id = 'grading-images' and (storage.foldername(name))[1] = auth.uid()::text
) with check (bucket_id = 'grading-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "grading images read own or admin" on storage.objects for select to authenticated using (
  bucket_id = 'grading-images' and (
    (storage.foldername(name))[1] = auth.uid()::text or
    exists (select 1 from public.profiles where user_id = auth.uid() and role = 'admin')
  )
);
