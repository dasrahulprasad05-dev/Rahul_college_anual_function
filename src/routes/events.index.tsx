import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { eventColors } from "@/lib/event-color";

export const Route = createFileRoute("/events/")({
  head: () => ({
    meta: [
      { title: "All Events — Festa" },
      { name: "description", content: "Browse every published event of the annual function and book your QR ticket." },
      { property: "og:title", content: "All Events — Festa" },
      { property: "og:description", content: "Browse every published event of the annual function and book your QR ticket." },
    ],
  }),
  component: AllEvents,
});

function AllEvents() {
  const { data: events, isLoading } = useQuery({
    queryKey: ["events", "all-published"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("is_published", true)
        .order("event_date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <span className="text-xs tracking-[0.3em] text-accent uppercase">— Line-up</span>
          <h1 className="font-display text-5xl md:text-6xl mt-2 uppercase">
            All <span className="text-gradient-neon">events</span>
          </h1>
          <p className="text-muted-foreground mt-3 max-w-xl">
            Tap any card to see items, prices, and live seat counts. Booking takes a single tap once you're signed in.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-56 rounded-2xl bg-card/40 animate-pulse" />
            ))}
          </div>
        ) : !events?.length ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
            No events published yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((e, i) => {
              const c = eventColors(e.id);
              return (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: (i % 6) * 0.06, duration: 0.5 }}
                >
                  <Link
                    to="/events/$eventId"
                    params={{ eventId: e.id }}
                    className="group relative block rounded-2xl border border-border/60 bg-card/60 backdrop-blur p-6 overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:border-transparent"
                    style={{ ["--glow" as string]: c.glow }}
                  >
                    {/* color-reveal blob */}
                    <div
                      aria-hidden
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background: c.gradient, mixBlendMode: "overlay" }}
                    />
                    <div
                      aria-hidden
                      className="absolute -top-16 -right-16 w-44 h-44 rounded-full blur-3xl opacity-0 group-hover:opacity-80 transition duration-500"
                      style={{ background: `radial-gradient(circle, ${c.primary}, transparent 70%)` }}
                    />
                    <div className="relative flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-display text-2xl uppercase line-clamp-2 transition-colors duration-500 group-hover:[background:var(--gd)] group-hover:bg-clip-text group-hover:text-transparent"
                            style={{ ["--gd" as string]: c.gradient }}>
                          {e.name}
                        </h3>
                        {e.description && (
                          <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">{e.description}</p>
                        )}
                      </div>
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:rotate-12"
                        style={{ background: c.gradient, boxShadow: c.glow }}
                      >
                        <ArrowRight className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="relative flex items-center gap-4 mt-5 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" style={{ color: c.primary }} />
                        {new Date(e.event_date).toLocaleDateString(undefined, { dateStyle: "medium" })}
                      </span>
                      {e.venue && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" style={{ color: c.secondary }} />
                          {e.venue}
                        </span>
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
