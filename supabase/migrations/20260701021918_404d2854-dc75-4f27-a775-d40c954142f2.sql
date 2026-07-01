
CREATE TABLE public.event_volunteers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);

GRANT SELECT, INSERT, DELETE ON public.event_volunteers TO authenticated;
GRANT ALL ON public.event_volunteers TO service_role;

ALTER TABLE public.event_volunteers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage assignments"
  ON public.event_volunteers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Volunteers view own assignments"
  ON public.event_volunteers FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX event_volunteers_user_idx ON public.event_volunteers(user_id);
CREATE INDEX event_volunteers_event_idx ON public.event_volunteers(event_id);

-- Update check_in_ticket to enforce volunteer↔event assignment
CREATE OR REPLACE FUNCTION public.check_in_ticket(_qr_token text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  _user uuid := auth.uid();
  _ticket public.tickets%ROWTYPE;
  _item_name text;
  _event_name text;
  _event_id uuid;
  _is_admin boolean;
BEGIN
  IF _user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  _is_admin := public.has_role(_user, 'admin');
  IF NOT (_is_admin OR public.has_role(_user, 'volunteer')) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  SELECT * INTO _ticket FROM public.tickets WHERE qr_token = _qr_token;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('kind', 'invalid', 'message', 'Unknown QR code');
  END IF;

  SELECT i.name, e.name, e.id INTO _item_name, _event_name, _event_id
  FROM public.items i JOIN public.events e ON e.id = i.event_id
  WHERE i.id = _ticket.item_id;

  -- Enforce assignment: volunteers must be assigned to this event; admins bypass.
  IF NOT _is_admin AND NOT EXISTS (
    SELECT 1 FROM public.event_volunteers
    WHERE event_id = _event_id AND user_id = _user
  ) THEN
    RETURN jsonb_build_object('kind', 'invalid', 'message', 'Not assigned to this event');
  END IF;

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
$function$;

REVOKE EXECUTE ON FUNCTION public.check_in_ticket(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_in_ticket(text) TO authenticated;
