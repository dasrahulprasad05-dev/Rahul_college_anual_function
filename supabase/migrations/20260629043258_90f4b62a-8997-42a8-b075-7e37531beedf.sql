
-- 1) Lock down SECURITY DEFINER functions: revoke from PUBLIC, grant only where needed.
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

REVOKE ALL ON FUNCTION public.book_ticket(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.book_ticket(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.check_in_ticket(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_in_ticket(text) TO authenticated;

-- Trigger-only functions: should not be callable from the API at all.
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user_role() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.tg_set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.tg_tickets_maintain_booked_count() FROM PUBLIC, anon, authenticated;

-- get_event_availability is SECURITY INVOKER and safe to call publicly.
-- (No change needed, but make grants explicit.)
GRANT EXECUTE ON FUNCTION public.get_event_availability(uuid) TO anon, authenticated;

-- 2) Allow volunteers to check-in tickets (update status/used_at/used_by).
DROP POLICY IF EXISTS "Volunteers can check in tickets" ON public.tickets;
CREATE POLICY "Volunteers can check in tickets"
ON public.tickets
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'volunteer'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'volunteer'::public.app_role));

-- 3) Harden items.booked_count against direct manipulation outside the trigger.
-- Even though only admins can UPDATE items, prevent any non-trigger write to booked_count
-- so the counter stays consistent with the tickets trigger.
CREATE OR REPLACE FUNCTION public.tg_items_protect_booked_count()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.booked_count IS DISTINCT FROM OLD.booked_count THEN
    -- Allow updates only when performed by a SECURITY DEFINER context (no auth.uid()),
    -- i.e. the tickets trigger. Any direct client/admin update is rejected.
    IF auth.uid() IS NOT NULL THEN
      RAISE EXCEPTION 'booked_count cannot be modified directly';
    END IF;
  END IF;
  IF TG_OP = 'INSERT' AND NEW.booked_count <> 0 AND auth.uid() IS NOT NULL THEN
    NEW.booked_count := 0;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS items_protect_booked_count ON public.items;
CREATE TRIGGER items_protect_booked_count
BEFORE INSERT OR UPDATE ON public.items
FOR EACH ROW EXECUTE FUNCTION public.tg_items_protect_booked_count();
