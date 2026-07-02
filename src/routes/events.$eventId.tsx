import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Ticket, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { sendTicketConfirmation } from "@/lib/emails.functions";

export const Route = createFileRoute("/events/$eventId")({
  component: EventDetail,
});

function EventDetail() {
  const { eventId } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const sendConfirmation = useServerFn(sendTicketConfirmation);

  const { data: event } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*").eq("id", eventId).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: items, isLoading } = useQuery({
    queryKey: ["items", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("event_id", eventId)
        .order("starts_at", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: availability } = useQuery({
    queryKey: ["availability", eventId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_event_availability" as never, { _event_id: eventId } as never);
      if (error) throw error;
      return (data ?? []) as Array<{ item_id: string; capacity: number | null; booked: number; available: number | null }>;
    },
    refetchInterval: 15000,
  });
  const availMap = new Map((availability ?? []).map((a) => [a.item_id, a]));

  const { data: myTickets } = useQuery({
    queryKey: ["my-tickets-for-event", eventId, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tickets")
        .select("item_id, status")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data;
    },
  });

  const bookedItemIds = new Set((myTickets ?? []).filter((t) => t.status !== "cancelled").map((t) => t.item_id));

  const book = useMutation({
    mutationFn: async (item: { id: string; price_cents: number }) => {
      if (!user) throw new Error("Please sign in");
      const { data, error } = await supabase.rpc("book_ticket" as never, { _item_id: item.id } as never);
      if (error) throw error;
      return data as { id: string } | null;
    },

    onSuccess: (ticket) => {
      toast.success("Ticket booked! Check 'My Tickets'.");
      qc.invalidateQueries({ queryKey: ["my-tickets-for-event", eventId] });
      qc.invalidateQueries({ queryKey: ["tickets"] });
      qc.invalidateQueries({ queryKey: ["availability", eventId] });
      if (ticket?.id) {
        sendConfirmation({ data: { ticketId: ticket.id } })
          .then((r) => {
            if (r?.ok) toast.success("Confirmation email sent");
          })
          .catch((e) => console.warn("Email send failed", e));
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" />Back to events
        </Link>

        {event && (
          <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur p-8 mb-8">
            <h1 className="text-4xl font-bold text-gradient-gold">{event.name}</h1>
            {event.description && <p className="mt-3 text-muted-foreground">{event.description}</p>}
            <div className="flex flex-wrap gap-4 mt-5 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{new Date(event.event_date).toLocaleDateString(undefined, { dateStyle: "full" })}</span>
              {event.venue && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{event.venue}</span>}
            </div>
          </div>
        )}

        <h2 className="text-2xl font-bold mb-4">Items</h2>
        {isLoading ? (
          <div className="h-32 rounded-xl bg-card/40 animate-pulse" />
        ) : !items?.length ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
            No items added yet.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const isBooked = bookedItemIds.has(item.id);
              const avail = availMap.get(item.id);
              const soldOut = avail?.available === 0;
              return (
                <div key={item.id} className="rounded-xl border border-border/60 bg-card/60 p-5 flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {item.category && <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground">{item.category}</span>}
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                    </div>
                    {item.description && <p className="text-sm text-muted-foreground mt-1">{item.description}</p>}
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                      {item.starts_at && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(item.starts_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</span>}
                      {item.venue && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.venue}</span>}
                    </div>
                    {avail && (
                      <div className="mt-2 text-xs">
                        {avail.capacity === null ? (
                          <span className="text-muted-foreground">{avail.booked} booked · unlimited seats</span>
                        ) : soldOut ? (
                          <span className="text-destructive font-medium">Sold out</span>
                        ) : (
                          <span className={(avail.available ?? 0) <= 10 ? "text-primary font-medium" : "text-muted-foreground"}>
                            {avail.available} of {avail.capacity} seats left
                          </span>
                        )}
                        {avail.capacity !== null && (
                          <div className="mt-1 h-1.5 w-40 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full gradient-gold"
                              style={{ width: `${Math.min(100, (avail.booked / Math.max(avail.capacity, 1)) * 100)}%` }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 md:flex-col md:items-end">
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {item.price_cents === 0 ? "Free" : `₹${(item.price_cents / 100).toFixed(0)}`}
                      </div>
                    </div>
                    {isBooked ? (
                      <Button variant="outline" disabled><Ticket className="w-4 h-4 mr-1.5" />Booked</Button>
                    ) : soldOut ? (
                      <Button variant="outline" disabled>Sold out</Button>
                    ) : (
                      <Button
                        onClick={() => user ? book.mutate(item) : navigate({ to: "/auth", search: { redirect: `/events/${eventId}` } })}
                        disabled={book.isPending}
                        className="gradient-gold text-primary-foreground hover:opacity-90"
                      >
                        <Ticket className="w-4 h-4 mr-1.5" />
                        {item.price_cents === 0 ? "Get ticket" : "Book"}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
