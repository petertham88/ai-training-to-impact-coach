-- Verify the owner RLS from 0002_auth_rls.sql was applied.
-- Run in the Supabase SQL editor after applying the migration.

-- 1) RLS is enabled on every app table
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'participants','work_problems','use_cases','prompts',
    'experiments','playbooks','outcomes','audit_logs'
  )
order by tablename;

-- 2) The new owner policies exist (v1 open policies should be gone)
select tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
order by tablename, cmd, policyname;

-- 3) No lingering "*_v1_*" open policies remain
select count(*) as leftover_v1_policies
from pg_policies
where schemaname = 'public' and policyname like '%_v1_%';

-- 4) Seed/demo rows are public (user_id IS NULL) so /demo still works
select 'participants' as tbl, count(*) filter (where user_id is null) as public_rows from participants
union all select 'playbooks', count(*) filter (where user_id is null) from playbooks
union all select 'outcomes', count(*) filter (where user_id is null) from outcomes;
