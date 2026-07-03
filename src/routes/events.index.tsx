import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { eventsService } from "@/services/firestore/events";
import { Navbar } from "@/components/Navbar";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { eventColors } from "@/lib/event-color";
import { HoverColorCard } from "@/components/ui/hover-color-card";

export const Route = createFileRoute("/events/")({
  head: () => ({
    meta: [
      { title: "All Events — Festa" },
      {
        name: "description",
        content: "Browse every published event of the annual function and book your QR ticket.",
      },
      { property: "og:title", content: "All Events — Festa" },
      {
        property: "og:description",
        content: "Browse every published event of the annual function and book your QR ticket.",
      },
    ],
  }),
  component: AllEvents,
});

function AllEvents() {
  const { data: events, isLoading } = useQuery({
    queryKey: ["events", "all-published"],
    queryFn: async () => {
      return eventsService.getEvents(true);
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
            Tap any card to see items, prices, and live seat counts. Booking takes a single tap once
            you're signed in.
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
                  <HoverColorCard key={e.id} eventId={e.id} name={e.name} description={e.description}>
                    <div className="relative flex items-center gap-4 text-sm text-muted-foreground">
                      {e.event_date && (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" style={{ color: c.primary }} />
                          {new Date(e.event_date).toLocaleDateString(undefined, {
                            dateStyle: "medium",
                          })}
                        </span>
                      )}
                      {e.venue && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" style={{ color: c.secondary }} />
                          {e.venue}
                        </span>
                      )}
                    </div>
                  </HoverColorCard>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
