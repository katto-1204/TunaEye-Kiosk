alter table public.grading_records
  add column capture_id text,
  add column inference_id text,
  add column raw_confidence double precision,
  add column scores jsonb,
  add column image_type text check (image_type is null or image_type in ('sashibocore', 'tailcut')),
  add column model_source text check (model_source is null or model_source in ('raspberry-pi', 'demo')),
  add column override_actor text,
  add column override_at timestamptz;

create function public.protect_grading_inference_provenance() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (old.original_grade is not null and new.original_grade is distinct from old.original_grade)
    or (old.confidence is not null and new.confidence is distinct from old.confidence)
    or (old.capture_id is not null and new.capture_id is distinct from old.capture_id)
    or (old.inference_id is not null and new.inference_id is distinct from old.inference_id)
    or (old.raw_confidence is not null and new.raw_confidence is distinct from old.raw_confidence)
    or (old.scores is not null and new.scores is distinct from old.scores)
    or (old.image_type is not null and new.image_type is distinct from old.image_type)
    or (old.model_source is not null and new.model_source is distinct from old.model_source) then
    raise exception 'Original inference provenance is immutable after it is stored';
  end if;
  return new;
end;
$$;

create trigger protect_grading_inference_provenance
before update on public.grading_records
for each row execute function public.protect_grading_inference_provenance();
