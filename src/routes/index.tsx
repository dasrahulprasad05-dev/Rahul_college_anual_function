import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { eventsService } from "@/services/firestore/events";
import { Navbar } from "@/components/Navbar";
import { Calendar, MapPin, Ticket, ScanLine, Sparkles, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { eventColors } from "@/lib/event-color";
import { HoverColorCard } from "@/components/ui/hover-color-card";
import { useState, useEffect } from "react";

const CursorSpotlight = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isDesktop = window.matchMedia("(pointer: fine)").matches;
    if (!isDesktop) return;

    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener("mousemove", updateMousePosition);
    document.body.addEventListener("mouseenter", handleMouseEnter);
    document.body.addEventListener("mouseleave", handleMouseLeave);
    setIsVisible(true);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      document.body.removeEventListener("mouseenter", handleMouseEnter);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full blur-[100px] opacity-20 mix-blend-screen"
        style={{
          background: "radial-gradient(circle, var(--neon-pink) 0%, transparent 60%)",
        }}
        animate={{
          x: mousePosition.x - 300,
          y: mousePosition.y - 300,
        }}
        transition={{
          type: "spring",
          damping: 50,
          stiffness: 400,
          mass: 0.5,
        }}
      />
    </motion.div>
  );
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Festa — College Annual Function 2026" },
      {
        name: "description",
        content:
          "Browse and book QR-coded tickets for performances, competitions, and ceremonies at the annual function.",
      },
    ],
  }),
  component: Index,
});

const marqueeWords = ["DANCE", "DRAMA", "MUSIC", "AWARDS", "FASHION", "BATTLES", "AFTERPARTY"];

function Index() {
  const { data: events, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const data = await eventsService.getEvents(true);
      return data.slice(0, 20);
    },
  });

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar />

      <CursorSpotlight />

      {/* HERO */}
      <section className="relative">
        <div className="absolute inset-0 grid-bg opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
        {/* Floating neon blobs */}
        <motion.div
          aria-hidden
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(255,46,147,0.55), transparent 65%)" }}
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute top-40 -right-24 w-[28rem] h-[28rem] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(33,212,253,0.45), transparent 65%)" }}
          animate={{ x: [0, -50, 0], y: [0, 40, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative max-w-6xl mx-auto px-4 pt-16 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/40 bg-primary/10 text-sm mb-8"
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
            <span className="text-foreground/80 tracking-wide">LIVE · ANNUAL FUNCTION 2026</span>
          </motion.div>

          <h1 className="font-display text-[14vw] md:text-[8.5rem] leading-[0.85] tracking-tighter uppercase">
            {"FESTA".split("").map((c, i) => (
              <motion.span
                key={i}
                initial={{ y: 80, opacity: 0, rotateX: -60 }}
                animate={{ y: 0, opacity: 1, rotateX: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="inline-block"
              >
                <span className={i % 2 === 0 ? "text-foreground" : "text-gradient-neon"}>{c}</span>
              </motion.span>
            ))}
          </h1>

          <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="max-w-md text-base md:text-lg text-muted-foreground"
            >
              Three nights. One stage. QR tickets for every show — book it, scan it, scream it.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.6 }}
              className="flex gap-3"
            >
              <Button
                size="lg"
                className="gradient-gold text-primary-foreground hover:opacity-90 group"
                asChild
              >
                <Link to="/events">
                  <Ticket className="w-4 h-4 mr-2" />
                  Browse events
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-accent/50 hover:border-accent"
                asChild
              >
                <Link to="/tickets">My tickets</Link>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Marquee */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="relative border-y border-border/50 bg-background/40 backdrop-blur py-5 overflow-hidden"
        >
          <div className="flex whitespace-nowrap animate-marquee w-max">
            {[...marqueeWords, ...marqueeWords, ...marqueeWords].map((w, i) => (
              <span
                key={i}
                className="font-display text-3xl md:text-5xl uppercase mx-8 flex items-center gap-8"
              >
                <span
                  className={
                    i % 3 === 0
                      ? "text-gradient-neon"
                      : i % 3 === 1
                        ? "text-foreground"
                        : "text-accent"
                  }
                >
                  {w}
                </span>
                <Sparkles className="w-6 h-6 text-primary shrink-0" />
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* FEATURE STRIP */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: Ticket,
              title: "QR Tickets",
              desc: "Unique QR per ticket. Delivered instantly to your account.",
              color: "var(--neon-pink)",
            },
            {
              icon: ScanLine,
              title: "Scan & enter",
              desc: "Volunteers scan at the gate — no paper, no lines, no fakes.",
              color: "var(--neon-cyan)",
            },
            {
              icon: Zap,
              title: "Item-level access",
              desc: "Pick exactly the shows you want — every item booked separately.",
              color: "var(--neon-yellow)",
            },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              whileHover={{ y: -4 }}
              className="group relative rounded-2xl border border-border/60 bg-card/40 backdrop-blur p-6 overflow-hidden"
            >
              <div
                aria-hidden
                className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-500"
                style={{ background: `radial-gradient(circle, ${f.color}, transparent 70%)` }}
              />
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{
                  background: `color-mix(in oklab, ${f.color} 18%, transparent)`,
                  color: f.color,
                }}
              >
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="font-display text-lg uppercase tracking-tight">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-2">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* EVENTS */}
      <section id="events" className="max-w-6xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <span className="text-xs tracking-[0.3em] text-accent uppercase">— Line-up</span>
            <h2 className="font-display text-5xl md:text-6xl mt-2 uppercase">
              Upcoming <span className="text-gradient-neon">events</span>
            </h2>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-56 rounded-2xl bg-card/40 animate-pulse" />
            ))}
          </div>
        ) : !events?.length ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <p className="text-muted-foreground">
              No events published yet. Admins can create events from the Admin panel.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((e, i) => {
              const c = eventColors(e.id);
              return (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.08, duration: 0.55 }}
                >
                <HoverColorCard key={e.id} eventId={e.id} name={e.name} description={e.description}>
                    <div className="relative flex items-center gap-4 mt-5 text-sm text-muted-foreground">
                      {e.event_date && (
                        <span className="flex items-center gap-1.5">
                          <Calendar
                            className="w-4 h-4 transition-colors"
                            style={{ color: c.primary }}
                          />
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
      </section>

      <footer className="border-t border-border/50 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-muted-foreground text-center">
          Festa · Built for college fests
        </div>
      </footer>
    </div>
  );
}
