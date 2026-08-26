-- 0005: lineage root for the north-star (Artifact Improvement Reach).
--
-- The north-star is a per-artifact-lineage ratio: an original submission plus every
-- resubmission chained to it via previous_submission_id is ONE artifact. Computing that in
-- PostHog is impossible from the event stream alone (events have no lineage id). This column
-- denormalizes the lineage root onto every submission so it can ride along on the
-- `evaluation_completed` / `level_improved` events and PostHog can group by it directly.
--
-- Semantics match analytics-queries.sql exactly: a root submission points at itself; a
-- resubmission inherits its parent's root.

alter table submissions
  add column root_submission_id uuid references submissions(id) on delete set null;

-- Backfill existing rows by walking previous_submission_id to the root (same recursion as the
-- validated north-star query, applied once).
with recursive lineage as (
  select id as submission_id, id as root_id
  from submissions
  where previous_submission_id is null
  union all
  select s.id, l.root_id
  from submissions s
  join lineage l on s.previous_submission_id = l.submission_id
)
update submissions s
set root_submission_id = l.root_id
from lineage l
where s.id = l.submission_id;

-- Keep it filled automatically on every future insert, regardless of write path, so the app
-- code stays dumb and no path can forget to set it. Column defaults (gen_random_uuid on id)
-- are evaluated before BEFORE-INSERT triggers fire, so new.id is available for a root row.
create or replace function set_root_submission_id()
returns trigger language plpgsql as $$
begin
  if new.previous_submission_id is null then
    new.root_submission_id := new.id;
  else
    select root_submission_id into new.root_submission_id
    from submissions where id = new.previous_submission_id;
    -- defensive: a parent with no root (shouldn't happen post-backfill) falls back to self
    if new.root_submission_id is null then
      new.root_submission_id := new.id;
    end if;
  end if;
  return new;
end $$;

create trigger trg_set_root_submission_id
  before insert on submissions
  for each row execute function set_root_submission_id();

create index idx_submissions_root on submissions(root_submission_id);
