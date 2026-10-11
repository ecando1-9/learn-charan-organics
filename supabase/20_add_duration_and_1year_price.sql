-- Add 1-year tier price column to public.lms_courses
alter table public.lms_courses
  add column if not exists price_1year_inr integer default null;

comment on column public.lms_courses.price_1year_inr is 'Optional price for 1-year extended access tier. Defaults to null / standard price.';
