create table if not exists product_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  rating smallint not null check (rating between 1 and 5),
  tags text[] not null default '{}',
  comment text,
  page text,
  created_at timestamptz not null default now(),
  constraint has_signal check (
    array_length(tags, 1) > 0 or (comment is not null and length(trim(comment)) > 0)
  )
);

alter table product_feedback enable row level security;
-- No browser-facing policy, same pattern as submissions/evaluations/feedback_outcomes:
-- all access goes through the service-role server client in the API route below.
