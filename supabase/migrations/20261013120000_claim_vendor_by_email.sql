-- Stalls created by an admin (Onboard New Vendor) have user_id = NULL until the
-- vendor signs in. With user_id NULL, owns_vendor() is false, so row-level
-- security blocked the vendor from adding products ("new row violates
-- row-level security policy for table products").
--
-- 1) claim_my_vendor(): links every unclaimed stall whose email matches the
--    signed-in user's verified email. Called by the app right after login.
-- 2) One-time backfill for vendors who already have an auth account.

create or replace function claim_my_vendor()
returns integer
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_email text;
  v_count integer;
begin
  if auth.uid() is null then
    return 0;
  end if;
  select lower(email) into v_email from auth.users where id = auth.uid();
  if v_email is null then
    return 0;
  end if;
  update vendors
     set user_id = auth.uid()
   where user_id is null
     and lower(email) = v_email;
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function claim_my_vendor() from public;
grant execute on function claim_my_vendor() to authenticated;

-- Backfill: link existing unclaimed stalls to existing accounts with the same email.
update vendors v
   set user_id = u.id
  from auth.users u
 where v.user_id is null
   and lower(u.email) = lower(v.email);
