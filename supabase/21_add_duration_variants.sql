-- Add duration_variants jsonb column to public.lms_courses
alter table public.lms_courses
  add column if not exists duration_variants jsonb default '[]'::jsonb;

comment on column public.lms_courses.duration_variants is 'Dynamic pricing and duration variants, e.g. [{"id":"6m","name":"6 Months","price_inr":199,"is_default":true},{"id":"1y","name":"1 Year","price_inr":299}]';
