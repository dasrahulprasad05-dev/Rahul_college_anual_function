import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Navbar } from "@/components/Navbar";
import { Calendar, MapPin, CheckCircle2, Clock, Sparkles } from "lucide-react";
import { eventColors } from "@/lib/event-color";

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

function TicketsPage() {
  const { user } = useAuth();

  const { data: tickets, isLoading } = useQuery({
    queryKey: ["tickets", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tickets")
        .select("id, qr_token, status, price_cents, issued_at, used_at, items(name, starts_at, venue, events(id, name, event_date))")
        .eq("user_id", user!.id)
        .order("issued_at", { ascending: false });
      if (error) throw error;
      return data as unknown as TicketRow[];
    },
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="font-display text-4xl uppercase mb-2">My <span className="text-gradient-neon">Tickets</span></h1>
        <p className="text-muted-foreground mb-8">Each ticket gets its own color and QR — show it at the gate to scan in.</p>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2].map((i) => <div key={i} className="h-80 rounded-2xl bg-card/40 animate-pulse" />)}
          </div>
        ) : !tickets?.length ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
            No tickets yet. Browse events from the home page.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {tickets.map((t, i) => {
              const eventId = t.items?.events?.id ?? t.id;
              const c = eventColors(eventId);
              const used = t.status === "used";
              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.45 }}
                  className="relative rounded-3xl overflow-hidden p-[1.5px]"
                  style={{ background: c.gradient, boxShadow: c.glow }}
                >
                  <div className="rounded-[calc(1.5rem-1px)] bg-background/95 backdrop-blur overflow-hidden">
                    {/* Header band */}
                    <div className="relative px-6 py-5" style={{ background: c.gradient }}>
                      <div className="absolute inset-0 opacity-30 mix-blend-overlay"
                           style={{ background: "radial-gradient(circle at 80% 20%, white, transparent 60%)" }} />
                      <div className="relative flex items-start justify-between gap-3 text-white">
                        <div className="min-w-0">
                          <div className="text-[10px] tracking-[0.25em] uppercase opacity-80">{t.items?.events?.name ?? "Event"}</div>
                          <h3 className="font-display text-2xl uppercase mt-0.5 line-clamp-2">{t.items?.name}</h3>
                        </div>
                        <Sparkles className="w-5 h-5 shrink-0 opacity-90" />
                      </div>
                      <div className="relative flex flex-wrap gap-3 mt-3 text-[11px] text-white/90">
                        {t.items?.starts_at && (
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />
                            {new Date(t.items.starts_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                          </span>
                        )}
                        {t.items?.venue && (
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{t.items.venue}</span>
                        )}
                        {!t.items?.starts_at && t.items?.events?.event_date && (
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />
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

                    {/* QR */}
                    <div className="p-6 flex flex-col items-center justify-center bg-white">
                      <div className={`p-3 rounded-2xl relative ${used ? "opacity-30" : ""}`}
                           style={{ background: c.gradient }}>
                        <div className="rounded-xl bg-white p-3">
                          <QRCodeSVG
                            value={t.qr_token}
                            size={176}
                            level="H"
                            fgColor={`hsl(${c.hue} 80% 28%)`}
                            bgColor="#ffffff"
                          />
                        </div>
                      </div>
                      <div className="mt-4 text-center">
                        {used ? (
                          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                            <CheckCircle2 className="w-3 h-3" />Used {t.used_at && new Date(t.used_at).toLocaleString()}
                          </span>
                        ) : t.status === "reserved" ? (
                          <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-700">Payment pending</span>
                        ) : (
                          <span className="text-xs px-2.5 py-1 rounded-full text-white" style={{ background: c.gradient }}>
                            Valid · Ready to scan
                          </span>
                        )}
                        <p className="text-[10px] text-muted-foreground mt-2 font-mono tracking-wider">
                          {t.qr_token.slice(0, 8).toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
