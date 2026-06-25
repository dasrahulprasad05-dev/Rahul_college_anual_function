
-- Restrict items SELECT to published events
DROP POLICY "Items viewable by everyone" ON public.items;
CREATE POLICY "Published items viewable by everyone" ON public.items
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = items.event_id
        AND (events.is_published = true OR has_role(auth.uid(), 'admin'::app_role))
    )
  );

-- Allow admins/volunteers to view profiles
CREATE POLICY "Admins and volunteers view profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'volunteer'::app_role)
  );

-- Remove direct user INSERT and self-UPDATE on tickets
DROP POLICY "Users book own tickets" ON public.tickets;
DROP POLICY "Volunteers and admins update tickets" ON public.tickets;
CREATE POLICY "Volunteers and admins update tickets" ON public.tickets
  FOR UPDATE TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'volunteer'::app_role)
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'volunteer'::app_role)
  );

-- Server-side booking function: validates item/event/capacity, sets trusted price
CREATE OR REPLACE FUNCTION public.book_ticket(_item_id uuid)
RETURNS public.tickets
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  _user uuid := auth.uid();
  _item public.items%ROWTYPE;
  _event public.events%ROWTYPE;
  _booked int;
  _new public.tickets;
BEGIN
  IF _user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO _item FROM public.items WHERE id = _item_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Item not found'; END IF;

  SELECT * INTO _event FROM public.events WHERE id = _item.event_id;
  IF NOT FOUND OR NOT _event.is_published THEN
    RAISE EXCEPTION 'Event unavailable';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.tickets
    WHERE user_id = _user AND item_id = _item_id AND status <> 'cancelled'
  ) THEN
    RAISE EXCEPTION 'Already booked';
  END IF;

  IF _item.capacity IS NOT NULL THEN
    SELECT count(*) INTO _booked FROM public.tickets
    WHERE item_id = _item_id AND status <> 'cancelled';
    IF _booked >= _item.capacity THEN
      RAISE EXCEPTION 'Sold out';
    END IF;
  END IF;

  INSERT INTO public.tickets (item_id, user_id, price_cents, status)
  VALUES (
    _item_id,
    _user,
    _item.price_cents,
    CASE WHEN _item.price_cents = 0 THEN 'paid'::ticket_status ELSE 'reserved'::ticket_status END
  )
  RETURNING * INTO _new;

  RETURN _new;
END;
$$;

REVOKE ALL ON FUNCTION public.book_ticket(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.book_ticket(uuid) TO authenticated;

-- Harden existing functions: explicit search_path + tighten EXECUTE
ALTER FUNCTION public.tg_set_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.has_role(uuid, app_role) SET search_path = public, pg_temp;
ALTER FUNCTION public.handle_new_user() SET search_path = public, pg_temp;
ALTER FUNCTION public.handle_new_user_role() SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION public.tg_set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user_role() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
