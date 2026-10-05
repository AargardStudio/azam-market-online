-- Fix infinite-recursion RLS bug on admin_users.
--
-- admin_users_super_admin_write used a raw subquery back against admin_users
-- in its USING/CHECK clause. Because that subquery runs as the calling
-- (non-owner) role, it is itself subject to admin_users' RLS policies,
-- which re-triggers this same policy -> infinite recursion
-- ("infinite recursion detected in policy for relation admin_users").
--
-- is_admin() avoids this because it's a security definer function owned by
-- postgres (the table owner), so its internal query bypasses RLS entirely.
-- Apply the same pattern here with a dedicated is_super_admin() helper.

create or replace function is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from admin_users a
    where a.user_id = auth.uid() and a.role = 'super_admin'
  );
$$;

drop policy if exists "admin_users_super_admin_write" on admin_users;
create policy "admin_users_super_admin_write" on admin_users
  for all using (is_super_admin())
  with check (is_super_admin());
