
-- 1. Defense-in-depth: explicitly deny direct INSERT on tickets.
--    book_ticket() is SECURITY DEFINER and bypasses RLS, so this does not
--    affect the legitimate booking flow.
CREATE POLICY "Deny direct ticket inserts"
ON public.tickets AS RESTRICTIVE
FOR INSERT TO anon, authenticated
WITH CHECK (false);

-- 2. Restrict volunteers to a narrow check-in path; remove their general UPDATE.
DROP POLICY IF EXISTS "Volunteers and admins update tickets" ON public.tickets;
DROP POLICY IF EXISTS "Admins can update tickets" ON public.tickets;

CREATE POLICY "Admins can update tickets"
ON public.tickets FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.check_in_ticket(_qr_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  _user uuid := auth.uid();
  _ticket public.tickets%ROWTYPE;
  _item_name text;
  _event_name text;
BEGIN
  IF _user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF NOT (public.has_role(_user, 'admin') OR public.has_role(_user, 'volunteer')) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  SELECT * INTO _ticket FROM public.tickets WHERE qr_token = _qr_token;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('kind', 'invalid', 'message', 'Unknown QR code');
  END IF;

  SELECT i.name, e.name INTO _item_name, _event_name
  FROM public.items i JOIN public.events e ON e.id = i.event_id
  WHERE i.id = _ticket.item_id;

  IF _ticket.status = 'used' THEN
    RETURN jsonb_build_object('kind', 'already', 'used_at', _ticket.used_at,
      'item', _item_name, 'event', _event_name);
  END IF;
  IF _ticket.status = 'cancelled' THEN
    RETURN jsonb_build_object('kind', 'invalid', 'message', 'Ticket cancelled');
  END IF;
  IF _ticket.status <> 'paid' AND _ticket.status <> 'reserved' THEN
    RETURN jsonb_build_object('kind', 'invalid', 'message', 'Ticket not valid');
  END IF;

  UPDATE public.tickets
     SET status = 'used', used_at = now(), used_by = _user
   WHERE id = _ticket.id;

  RETURN jsonb_build_object('kind', 'success',
    'item', _item_name, 'event', _event_name);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.check_in_ticket(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_in_ticket(text) TO authenticated;

-- 3. Track booked_count on items via trigger so availability needs no elevated reads.
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS booked_count int NOT NULL DEFAULT 0;

UPDATE public.items i SET booked_count = COALESCE((
  SELECT count(*) FROM public.tickets t
  WHERE t.item_id = i.id AND t.status <> 'cancelled'
), 0);

CREATE OR REPLACE FUNCTION public.tg_tickets_maintain_booked_count()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status <> 'cancelled' THEN
      UPDATE public.items SET booked_count = booked_count + 1 WHERE id = NEW.item_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.status <> 'cancelled' THEN
      UPDATE public.items SET booked_count = GREATEST(booked_count - 1, 0) WHERE id = OLD.item_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.item_id IS DISTINCT FROM NEW.item_id OR OLD.status IS DISTINCT FROM NEW.status THEN
      IF OLD.status <> 'cancelled' THEN
        UPDATE public.items SET booked_count = GREATEST(booked_count - 1, 0) WHERE id = OLD.item_id;
      END IF;
      IF NEW.status <> 'cancelled' THEN
        UPDATE public.items SET booked_count = booked_count + 1 WHERE id = NEW.item_id;
      END IF;
    END IF;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS tickets_maintain_booked_count ON public.tickets;
CREATE TRIGGER tickets_maintain_booked_count
AFTER INSERT OR UPDATE OR DELETE ON public.tickets
FOR EACH ROW EXECUTE FUNCTION public.tg_tickets_maintain_booked_count();

-- 4. Re-create get_event_availability as SECURITY INVOKER reading only items.
--    Items SELECT policy already allows anon for published events.
DROP FUNCTION IF EXISTS public.get_event_availability(uuid);

CREATE OR REPLACE FUNCTION public.get_event_availability(_event_id uuid)
RETURNS TABLE(item_id uuid, capacity int, booked int, available int)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
  SELECT
    i.id AS item_id,
    i.capacity,
    i.booked_count AS booked,
    CASE WHEN i.capacity IS NULL THEN NULL
         ELSE GREATEST(i.capacity - i.booked_count, 0) END AS available
  FROM public.items i
  WHERE i.event_id = _event_id;
$$;

REVOKE EXECUTE ON FUNCTION public.get_event_availability(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_event_availability(uuid) TO anon, authenticated;
