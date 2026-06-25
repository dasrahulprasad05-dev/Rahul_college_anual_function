import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Calendar, MapPin, Sparkles, Ticket, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Festa — College Annual Function 2026" },
      { name: "description", content: "Browse and book QR-coded tickets for performances, competitions, and ceremonies at the annual function." },
    ],
  }),
  component: Index,
});

function Index() {
  const { data: events, isLoading } = useQuery({
    queryKey: ["events"],
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

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-16 pb-12">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-sm mb-6">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-muted-foreground">Annual Function 2026</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            A night to <span className="text-gradient-gold">remember</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Book QR-coded tickets for every performance, competition, and ceremony. Walk in. Get scanned. Enjoy.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button size="lg" className="gradient-gold text-primary-foreground hover:opacity-90" asChild>
              <a href="#events"><Ticket className="w-4 h-4 mr-2" />Browse events</a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/tickets">My tickets</Link>
            </Button>
          </div>
        </div>

        {/* Feature strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16">
          {[
            { icon: Ticket, title: "QR Tickets", desc: "Every ticket carries a unique QR code, instantly delivered to your account." },
            { icon: ScanLine, title: "Scan & enter", desc: "Volunteers scan at the gate — no paper, no lines, no fakes." },
            { icon: Sparkles, title: "Item-level access", desc: "Pick exactly the items you want — dance night, drama, awards, all separate." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur p-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Events */}
      <section id="events" className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Upcoming events</h2>
            <p className="text-muted-foreground mt-1">Tap an event to see all its items and book tickets.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-56 rounded-2xl bg-card/40 animate-pulse" />
            ))}
          </div>
        ) : !events?.length ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <p className="text-muted-foreground">No events published yet. Admins can create events from the Admin panel.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((e) => (
              <Link
                key={e.id}
                to="/events/$eventId"
                params={{ eventId: e.id }}
                className="group rounded-2xl border border-border/60 bg-card/60 backdrop-blur p-6 hover:border-primary/50 hover:bg-card transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold group-hover:text-primary transition">{e.name}</h3>
                    {e.description && <p className="text-muted-foreground mt-2 line-clamp-2">{e.description}</p>}
                  </div>
                  <div className="w-12 h-12 rounded-xl gradient-gold flex items-center justify-center shrink-0">
                    <Sparkles className="w-6 h-6 text-primary-foreground" />
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-5 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{new Date(e.event_date).toLocaleDateString(undefined, { dateStyle: "medium" })}</span>
                  {e.venue && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{e.venue}</span>}
                </div>
              </Link>
            ))}
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
