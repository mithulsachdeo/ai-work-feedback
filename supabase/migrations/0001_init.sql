-- Identity (access-controlled). One row per auth user.
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text,
  consented_at timestamptz,
  created_at timestamptz default now()
);

-- Content (linked by user_id UUID only — never email).
create table submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  type text not null check (type in ('work_product','implementation_logic','concept_articulation')),
  intent text not null,  -- (fixed 2026-08-21, from requirements audit) was nullable; the purpose/text-mismatch guardrail (rubric spec §3) has nothing to compare against without it
  text text not null,
  original_draft text,  -- (added 2026-08-21, from requirements audit) implementation_logic only: the AI's pre-edit draft, paired with `text` (the user's corrected version) as the dual-capture verification signal (rubric spec §3/§4)
  previous_submission_id uuid references submissions(id) on delete set null,  -- resubmission lineage
  created_at timestamptz default now()
);

create table evaluations (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references submissions(id) on delete cascade,
  result_json jsonb not null,
  provider text not null,
  model text not null,
  byo boolean not null default false,
  created_at timestamptz default now()
);

-- Gold signal for improving feedback.
create table feedback_outcomes (
  id uuid primary key default gen_random_uuid(),
  evaluation_id uuid not null references evaluations(id) on delete cascade,
  action text not null check (action in ('viewed_fix','resubmitted','self_report')),
  resubmission_improved boolean,
  created_at timestamptz default now()
);

create table daily_usage (
  user_id uuid not null references profiles(id) on delete cascade,
  day date not null,
  count int not null default 0,
  primary key (user_id, day)
);

-- Quota is split into a read (before eval) and a consume (only after a successful eval),
-- so failed / not_evaluable evaluations never burn a user's daily allowance.
create or replace function used_today(p_user uuid)
returns int language sql stable as $$
  select coalesce((select count from daily_usage where user_id = p_user and day = current_date), 0);
$$;

create or replace function consume_quota(p_user uuid)
returns void language plpgsql as $$
begin
  insert into daily_usage (user_id, day, count) values (p_user, current_date, 1)
    on conflict (user_id, day) do update set count = daily_usage.count + 1;
end $$;

-- Row-Level Security: deny all browser access to content/usage tables (the service-role
-- server client bypasses RLS); let a user manage ONLY their own profile row.
alter table profiles enable row level security;
alter table submissions enable row level security;
alter table evaluations enable row level security;
alter table feedback_outcomes enable row level security;
alter table daily_usage enable row level security;

create policy "own profile" on profiles for all
  using (id = auth.uid()) with check (id = auth.uid());
-- No policies on submissions/evaluations/feedback_outcomes/daily_usage → all reads/writes
-- must go through the service-role server client (lib/data.ts, lib/quota.ts). The public
-- anon key in the browser therefore cannot read any user's content.
