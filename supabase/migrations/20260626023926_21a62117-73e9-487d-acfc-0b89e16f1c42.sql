
CREATE OR REPLACE FUNCTION public.get_event_availability(_event_id uuid)
RETURNS TABLE(item_id uuid, capacity int, booked int, available int)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT
    i.id AS item_id,
    i.capacity,
    COALESCE(t.cnt, 0)::int AS booked,
    CASE WHEN i.capacity IS NULL THEN NULL ELSE GREATEST(i.capacity - COALESCE(t.cnt, 0), 0) END AS available
  FROM public.items i
  JOIN public.events e ON e.id = i.event_id
  LEFT JOIN (
    SELECT item_id, count(*)::int AS cnt
    FROM public.tickets
    WHERE status <> 'cancelled'
    GROUP BY item_id
  ) t ON t.item_id = i.id
  WHERE i.event_id = _event_id
    AND (e.is_published OR public.has_role(auth.uid(), 'admin'));
$$;

REVOKE EXECUTE ON FUNCTION public.get_event_availability(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_event_availability(uuid) TO anon, authenticated;
