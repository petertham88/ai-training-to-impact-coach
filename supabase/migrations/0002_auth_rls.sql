-- Sprint 4 — Lock it down: replace v1 open policies with per-user owner RLS.
--
-- HOW TO APPLY (owner action — Claude cannot apply DDL with only the anon key):
--   Supabase dashboard → SQL editor → paste this file → Run.
--   Then verify with supabase/verify_0002.sql.
--
-- IMPORTANT — read before applying:
--   * The app is already wired for this. Participant reads/writes go through the
--     logged-in user's session client, so auth.uid() = user_id is satisfied.
--   * Seed/demo rows have user_id IS NULL and stay publicly readable (the /demo
--     page keeps working).
--   * The trainer /admin + manager views read ACROSS users. Owner RLS forbids
--     that for anon. The app already reads those through serviceDb(), which uses
--     SUPABASE_SERVICE_ROLE_KEY when present. **Add that key to Vercel env before
--     (or right after) applying this**, or /admin + /manager will only see the
--     public demo rows. The service role bypasses RLS by design (server-only).
--
-- Owner model on every table: rows are owned by user_id = auth.uid().

-- ── participants ────────────────────────────────────────────────────────────
drop policy if exists "participants_v1_read" on participants;
drop policy if exists "participants_v1_write" on participants;

create policy "participants_read" on participants
  for select using (auth.uid() = user_id or user_id is null);
create policy "participants_insert" on participants
  for insert with check (auth.uid() = user_id);
-- allow claiming an unowned (seeded) participant by setting user_id to yourself
create policy "participants_update" on participants
  for update using (auth.uid() = user_id or user_id is null)
  with check (auth.uid() = user_id);
create policy "participants_delete" on participants
  for delete using (auth.uid() = user_id);

-- ── generic owner policies for the workflow tables ──────────────────────────
do $$
declare t text;
begin
  foreach t in array array[
    'work_problems','use_cases','prompts','experiments','playbooks','outcomes'
  ] loop
    execute format('drop policy if exists %I on %I', t || '_v1_read', t);
    execute format('drop policy if exists %I on %I', t || '_v1_write', t);

    execute format($f$
      create policy %I on %I
        for select using (auth.uid() = user_id or user_id is null)
    $f$, t || '_read', t);

    execute format($f$
      create policy %I on %I
        for insert with check (auth.uid() = user_id)
    $f$, t || '_insert', t);

    execute format($f$
      create policy %I on %I
        for update using (auth.uid() = user_id) with check (auth.uid() = user_id)
    $f$, t || '_update', t);

    execute format($f$
      create policy %I on %I
        for delete using (auth.uid() = user_id)
    $f$, t || '_delete', t);
  end loop;
end $$;

-- ── audit_logs — append-only; reads are server-only (service role) ──────────
drop policy if exists "audit_logs_v1_read" on audit_logs;
drop policy if exists "audit_logs_v1_write" on audit_logs;

-- anyone (incl. anon logging) may append; no one may read/update/delete except
-- the service role (which bypasses RLS). Keeps the trail private + tamper-proof.
create policy "audit_logs_insert" on audit_logs
  for insert with check (true);
