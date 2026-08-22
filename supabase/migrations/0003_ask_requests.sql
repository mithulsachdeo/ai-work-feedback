create table if not exists ask_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  evaluation_id uuid not null references evaluations(id),
  created_at timestamptz not null default now()
);
create index if not exists ask_requests_evaluation_idx on ask_requests(evaluation_id);
create index if not exists ask_requests_user_time_idx on ask_requests(user_id, created_at);

alter table ask_requests enable row level security;
-- No browser-facing policy, same pattern as every other content table — all access
-- goes through the service-role server client in app/api/ask/route.ts.
