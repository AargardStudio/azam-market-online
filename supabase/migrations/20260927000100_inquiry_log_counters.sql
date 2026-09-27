-- =========================================================================
-- Azam Market Online — 12: inquiry_logs counter-bumping trigger
-- =========================================================================
-- The old Express mock server incremented vendor/catalogue counters
-- server-side whenever an event was logged. Now that the client inserts
-- directly into inquiry_logs (see App.tsx logEvent), that bump has to
-- happen here instead, in a SECURITY DEFINER trigger — the client only
-- has insert access on inquiry_logs, not update access on vendors or
-- catalogues, so it cannot bump the counters itself even if it tried.

create or replace function bump_inquiry_counters()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.event_type = 'profile_view' then
    update vendors set profile_views = profile_views + 1 where id = new.vendor_id;
  elsif new.event_type = 'whatsapp_click' then
    update vendors set whatsapp_clicks = whatsapp_clicks + 1 where id = new.vendor_id;
  elsif new.event_type = 'email_click' then
    update vendors set email_clicks = email_clicks + 1 where id = new.vendor_id;
  elsif new.event_type = 'call_click' then
    update vendors set call_clicks = call_clicks + 1 where id = new.vendor_id;
  elsif new.event_type = 'message_click' then
    update vendors set message_clicks = message_clicks + 1 where id = new.vendor_id;
  elsif new.event_type = 'catalogue_download' then
    if new.catalogue_id is not null then
      update catalogues set download_count = download_count + 1 where id = new.catalogue_id;
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_bump_inquiry_counters
  after insert on inquiry_logs
  for each row execute function bump_inquiry_counters();
