alter table public.grading_records
  add column currency_code text,
  add column grade_unit_rate_per_kg numeric(12,2),
  add column total_fish_price numeric(14,2),
  add constraint grading_records_currency_code_check check (currency_code is null or currency_code ~ '^[A-Z]{3}$'),
  add constraint grading_records_unit_rate_check check (grade_unit_rate_per_kg is null or grade_unit_rate_per_kg >= 0),
  add constraint grading_records_total_price_check check (total_fish_price is null or total_fish_price >= 0);

create table public.price_schedules (
  user_id uuid not null references auth.users(id) on delete cascade,
  station_id text not null,
  grade public.tuna_grade not null check (grade <> 'Invalid'),
  currency_code text not null default 'PHP' check (currency_code ~ '^[A-Z]{3}$'),
  price_per_kg numeric(12,2) not null check (price_per_kg >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, station_id, grade)
);

alter table public.price_schedules enable row level security;
create policy "price schedules own" on public.price_schedules for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
