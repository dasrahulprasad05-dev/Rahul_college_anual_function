import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { eventsService } from "@/services/firestore/events";
import { ticketsService } from "@/services/firestore/tickets";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Ticket, ArrowLeft, Star, Plus, Minus, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { sendTicketConfirmation } from "@/services/email/ticket-emails";
import { feedbackService } from "@/services/firestore/feedback";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { eventColors } from "@/lib/event-color";

export const Route = createFileRoute("/events/$eventId")({
  component: EventDetail,
});

function EventDetail() {
  const { eventId } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const sendConfirmation = useServerFn(sendTicketConfirmation);
  
  const [cart, setCart] = useState<Record<string, number>>({});
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const { data: event } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      const e = await eventsService.getEvent(eventId);
      if (!e) throw new Error("Event not found");
      return e;
    },
  });

  const { data: items, isLoading } = useQuery({
    queryKey: ["items", eventId],
    queryFn: async () => {
      return eventsService.getEventItems(eventId);
    },
  });

  const { data: myTickets } = useQuery({
    queryKey: ["my-tickets-for-event", eventId, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const q = query(
        collection(db, "tickets"),
        where("user_id", "==", user!.id),
        where("event_id", "==", eventId),
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data());
    },
  });

  const bookedItemIds = new Set(
    (myTickets ?? []).filter((t) => t.status !== "cancelled").map((t) => t.item_id),
  );

  const book = useMutation({
    mutationFn: async (item: { id: string; price_cents: number; name: string }) => {
      if (!user) throw new Error("Please sign in");
      const ticketId = await ticketsService.bookTicket({
        userId: user.id,
        userEmail: user.email,
        eventId: eventId,
        eventName: event?.name,
        venue: event?.venue,
        itemId: item.id,
        itemName: item.name
      });
      return { id: ticketId };
    },
    onSuccess: (ticket) => {
      if (ticket?.id) {
        sendConfirmation({ data: { ticketId: ticket.id } as any }).catch(() => {});
      }
    }
  });

  const { data: feedbackData } = useQuery({
    queryKey: ["feedback", eventId],
    queryFn: () => feedbackService.getEventFeedback(eventId),
  });

  const avgRating = feedbackData?.length
    ? (feedbackData.reduce((acc, f) => acc + f.rating, 0) / feedbackData.length).toFixed(1)
    : null;

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalPrice = items?.reduce((acc, item) => acc + (cart[item.id] || 0) * item.price_cents, 0) || 0;
  const themeColor = eventColors(eventId).primary;

  const checkout = async () => {
    if (!user) {
      navigate({ to: "/auth", search: { redirect: `/events/${eventId}` } });
      return;
    }
    setIsCheckingOut(true);
    let successCount = 0;
    try {
      for (const [itemId, qty] of Object.entries(cart)) {
        if (qty <= 0) continue;
        const item = items?.find(i => i.id === itemId);
        if (!item) continue;
        for (let i = 0; i < qty; i++) {
          await book.mutateAsync(item as any);
          successCount++;
        }
      }
      setCart({});
      qc.invalidateQueries({ queryKey: ["my-tickets-for-event", eventId] });
      qc.invalidateQueries({ queryKey: ["tickets"] });
      qc.invalidateQueries({ queryKey: ["items", eventId] });
      if (successCount > 0) toast.success(`Successfully booked ${successCount} ticket(s)! Check 'My Tickets'.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Booking failed");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-0 relative bg-background">
      {/* Cinematic Header Blur */}
      {event && (
        <div 
          className="absolute top-0 left-0 w-full h-[40vh] md:h-[50vh] opacity-20 pointer-events-none"
          style={{ 
            background: `radial-gradient(ellipse at top, ${themeColor}, transparent 70%)`,
            filter: "blur(80px)"
          }} 
        />
      )}

      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to events
        </Link>

        {event && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/10 bg-background/40 backdrop-blur-xl p-8 mb-10 shadow-2xl overflow-hidden relative"
          >
            {/* Subtle glow inside card */}
            <div 
              className="absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none"
              style={{ backgroundColor: themeColor }}
            />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
              <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tight" style={{ color: themeColor }}>
                {event.name}
              </h1>
              {avgRating && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20">
                  <Star className="w-4 h-4 text-accent fill-accent" />
                  <span className="font-semibold text-accent">{avgRating}</span>
                  <span className="text-xs text-muted-foreground">({feedbackData?.length} reviews)</span>
                </div>
              )}
            </div>
            {event.description && <p className="mt-4 text-muted-foreground md:text-lg max-w-2xl">{event.description}</p>}
            <div className="flex flex-wrap gap-4 mt-6 text-sm text-foreground/80 font-medium">
              {event.event_date && (
                <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  {new Date(event.event_date).toLocaleDateString(undefined, { dateStyle: "full" })}
                </span>
              )}
              {event.venue && (
                <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  {event.venue}
                </span>
              )}
            </div>
          </motion.div>
        )}

        <h2 className="font-display text-2xl uppercase tracking-tight mb-6">Select Tickets</h2>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 rounded-xl bg-card/40 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : !items?.length ? (
          <div className="rounded-xl border border-dashed border-white/20 bg-background/30 backdrop-blur-md p-10 text-center text-muted-foreground">
            No tickets available for this event yet.
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const isBooked = bookedItemIds.has(item.id);
              const capacity = (item as any).capacity ?? null;
              const booked = (item as any).booked_count ?? 0;
              const available = capacity !== null ? capacity - booked : null;
              const soldOut = available !== null && available <= 0;
              const qty = cart[item.id] || 0;
              const maxQty = available !== null ? Math.min(4, available) : 4; // limit to 4 per tx

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-white/10 bg-background/50 backdrop-blur-md p-5 flex flex-col md:flex-row md:items-center gap-6 shadow-lg hover:border-white/20 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      {item.category && (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
                          {item.category}
                        </span>
                      )}
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                    </div>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mt-2">{item.description}</p>
                    )}
                    <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
                      {item.starts_at && (
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(item.starts_at).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      )}
                      {item.venue && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          {item.venue}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 text-xs">
                      {capacity === null ? (
                        <span className="text-muted-foreground/70 bg-white/5 px-2 py-1 rounded">
                          {booked} booked · unlimited seats
                        </span>
                      ) : soldOut ? (
                        <span className="text-destructive font-medium bg-destructive/10 px-2 py-1 rounded">Sold out</span>
                      ) : (
                        <span className={(available ?? 0) <= 10 ? "text-primary font-medium bg-primary/10 px-2 py-1 rounded" : "text-muted-foreground bg-white/5 px-2 py-1 rounded"}>
                          {available} of {capacity} seats left
                        </span>
                      )}
                      {capacity !== null && (
                        <div className="mt-2 h-1 w-40 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-1000 ease-out"
                            style={{ width: `${Math.min(100, (booked / Math.max(capacity, 1)) * 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between md:flex-col md:items-end gap-3 md:w-32">
                    <div className="text-2xl font-bold font-display">
                      {item.price_cents === 0 ? "Free" : `₹${(item.price_cents / 100).toFixed(0)}`}
                    </div>
                    
                    {isBooked ? (
                      <div className="text-sm font-medium text-green-500 bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20 flex items-center">
                        <CheckCircle2 className="w-4 h-4 mr-1.5" /> Booked
                      </div>
                    ) : soldOut ? (
                      <Button variant="outline" disabled className="w-full opacity-50 cursor-not-allowed">
                        Sold Out
                      </Button>
                    ) : (
                      <div className="flex items-center gap-3 bg-white/5 rounded-lg p-1 border border-white/10">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setCart(c => ({ ...c, [item.id]: Math.max(0, (c[item.id] || 0) - 1) }))}
                          disabled={qty === 0}
                          className="w-8 h-8 rounded flex items-center justify-center hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </motion.button>
                        <div className="w-4 flex items-center justify-center overflow-hidden">
                          <AnimatePresence mode="popLayout" initial={false}>
                            <motion.span
                              key={qty}
                              initial={{ y: -20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              exit={{ y: 20, opacity: 0 }}
                              transition={{ type: "spring", stiffness: 300, damping: 25 }}
                              className="text-center font-bold absolute"
                            >
                              {qty}
                            </motion.span>
                          </AnimatePresence>
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setCart(c => ({ ...c, [item.id]: Math.min(maxQty, (c[item.id] || 0) + 1) }))}
                          disabled={qty >= maxQty}
                          className="w-8 h-8 rounded flex items-center justify-center hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </motion.button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sticky Bottom Checkout Bar (Mobile & Desktop) */}
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 w-full z-50 p-4 pb-safe md:p-6"
          >
            <div className="max-w-4xl mx-auto rounded-2xl border border-white/20 bg-background/80 backdrop-blur-xl shadow-2xl p-4 md:p-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">{totalItems} ticket{totalItems > 1 ? 's' : ''}</p>
                <p className="text-xl md:text-2xl font-bold text-foreground">Total: ₹{(totalPrice / 100).toFixed(0)}</p>
              </div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  size="lg" 
                  onClick={checkout} 
                  disabled={isCheckingOut}
                  className="gradient-gold text-primary-foreground font-semibold shadow-lg shadow-primary/20 px-8"
                >
                  {isCheckingOut ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    <>Checkout <ArrowRight className="w-4 h-4 ml-2" /></>
                  )}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
