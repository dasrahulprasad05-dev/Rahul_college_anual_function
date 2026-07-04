import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Calendar, MapPin, CheckCircle2, Clock, Sparkles } from "lucide-react";
import { eventColors } from "@/lib/event-color";
import { FeedbackModal } from "@/components/tickets/FeedbackModal";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/tickets")({
  component: TicketsPage,
});

type TicketRow = {
  id: string;
  qr_token: string;
  status: string;
  price_cents: number;
  issued_at: string;
  used_at: string | null;
  items: {
    name: string;
    starts_at: string | null;
    venue: string | null;
    events: { id: string; name: string; event_date: string } | null;
  } | null;
};

function TicketCard({ t, i }: { t: TicketRow; i: number }) {
  const eventId = t.items?.events?.id ?? t.id;
  const c = eventColors(eventId);
  const used = t.status === "used";
  
  const [isRevealed, setIsRevealed] = useState(used);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.05, duration: 0.45 }}
      className="relative rounded-3xl overflow-hidden p-[1.5px] shadow-2xl"
      style={{ background: c.gradient, boxShadow: c.glow }}
    >
      <div className="rounded-[calc(1.5rem-1px)] bg-background/95 backdrop-blur overflow-hidden flex flex-col h-full">
        {/* Header band */}
        <div className="relative px-6 py-5" style={{ background: c.gradient }}>
          <div
            className="absolute inset-0 opacity-30 mix-blend-overlay"
            style={{
              background: "radial-gradient(circle at 80% 20%, white, transparent 60%)",
            }}
          />
          <div className="relative flex items-start justify-between gap-3 text-white">
            <div className="min-w-0">
              <div className="text-[10px] tracking-[0.25em] uppercase opacity-80">
                {t.items?.events?.name ?? "Event"}
              </div>
              <h3 className="font-display text-2xl uppercase mt-0.5 line-clamp-2">
                {t.items?.name}
              </h3>
            </div>
            <Sparkles className="w-5 h-5 shrink-0 opacity-90" />
          </div>
          <div className="relative flex flex-wrap gap-3 mt-3 text-[11px] text-white/90">
            {t.items?.starts_at && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(t.items.starts_at).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            )}
            {t.items?.venue && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {t.items.venue}
              </span>
            )}
            {!t.items?.starts_at && t.items?.events?.event_date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(t.items.events.event_date).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Perforation */}
        <div className="relative h-4 flex items-center" style={{ background: c.soft }}>
          <div className="absolute -left-2 w-4 h-4 rounded-full bg-background" />
          <div className="absolute -right-2 w-4 h-4 rounded-full bg-background" />
          <div className="flex-1 mx-3 border-t border-dashed border-foreground/20" />
        </div>

        {/* QR Section */}
        <div className="p-6 flex flex-col items-center justify-center bg-white flex-1 relative">
          <div 
            className="relative w-44 h-44 cursor-pointer" 
            style={{ perspective: "1000px" }}
            onClick={() => !used && setIsRevealed(!isRevealed)}
          >
            <motion.div 
              className="w-full h-full relative" 
              style={{ transformStyle: "preserve-3d" }}
              animate={{ rotateY: isRevealed ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              {/* Front (Hidden QR) */}
              <div 
                className={`absolute inset-0 flex flex-col items-center justify-center p-3 rounded-2xl ${used ? "opacity-30" : ""}`}
                style={{ background: c.gradient, backfaceVisibility: "hidden" }}
              >
                <div className="rounded-xl bg-white/95 w-full h-full flex flex-col items-center justify-center gap-3 shadow-inner">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: c.soft }}>
                    <Sparkles className="w-6 h-6" style={{ color: `hsl(${c.hue} 80% 28%)` }} />
                  </div>
                  <span className="font-semibold text-sm text-center px-4" style={{ color: `hsl(${c.hue} 80% 28%)` }}>
                    Tap to reveal QR
                  </span>
                </div>
              </div>

              {/* Back (Revealed QR) */}
              <div 
                className={`absolute inset-0 flex items-center justify-center p-3 rounded-2xl ${used ? "opacity-30" : ""}`}
                style={{ background: c.gradient, backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                <div className="rounded-xl bg-white p-2 shadow-inner w-full h-full flex items-center justify-center">
                  <QRCodeSVG
                    value={t.qr_token}
                    size={140}
                    level="H"
                    fgColor={`hsl(${c.hue} 80% 28%)`}
                    bgColor="#ffffff"
                  />
                </div>
              </div>
            </motion.div>
          </div>
          
          <div className="mt-5 text-center w-full">
            {used ? (
              <div className="flex flex-col gap-2">
                <span className="inline-flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-muted text-muted-foreground w-fit mx-auto border border-border">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Used {t.used_at && new Date(t.used_at).toLocaleDateString()}
                </span>
                <FeedbackModal ticketId={t.id} eventId={eventId} />
              </div>
            ) : t.status === "reserved" ? (
              <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                Payment pending
              </span>
            ) : (
              <span
                className="text-xs font-medium px-3 py-1.5 rounded-full text-white shadow-sm inline-block"
                style={{ background: c.gradient }}
              >
                Valid · Ready to scan
              </span>
            )}
            <p className="text-[11px] text-muted-foreground mt-3 font-mono tracking-widest opacity-60">
              {t.qr_token.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TicketsPage() {
  const { user } = useAuth();

  const { data: tickets, isLoading } = useQuery({
    queryKey: ["tickets", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const q = query(collection(db, "tickets"), where("user_id", "==", user!.id));
      const snap = await getDocs(q);
      const tickets = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as any);

      const populated = await Promise.all(
        tickets.map(async (t) => {
          const itemSnap = await getDoc(doc(db, `events/${t.event_id}/items/${t.item_id}`));
          const itemData = itemSnap.exists() ? itemSnap.data() : null;

          const eventSnap = await getDoc(doc(db, "events", t.event_id));
          const eventData = eventSnap.exists() ? { id: eventSnap.id, ...eventSnap.data() } : null;

          return {
            ...t,
            items: itemData
              ? {
                  name: itemData.name,
                  starts_at: itemData.starts_at ?? null,
                  venue: itemData.venue ?? null,
                  events: eventData
                    ? {
                        id: eventData.id,
                        name: (eventData as any).name,
                        event_date: (eventData as any).event_date,
                      }
                    : null,
                }
              : null,
          };
        }),
      );

      return populated.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ) as unknown as TicketRow[];
    },
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="font-display text-4xl uppercase tracking-tight mb-2">
          My <span className="text-gradient-neon">Tickets</span>
        </h1>
        <p className="text-muted-foreground mb-8">
          Your digital wallet. Tap a ticket to reveal its QR code at the venue.
        </p>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 rounded-3xl bg-card/40 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : !tickets?.length ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-background/50 backdrop-blur-md p-16 text-center text-muted-foreground flex flex-col items-center justify-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-white/5 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="text-lg font-medium text-foreground mb-2">Your wallet is empty</p>
            <p className="text-sm">Browse events from the home page to get tickets.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {tickets.map((t, i) => (
              <TicketCard key={t.id} t={t} i={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
