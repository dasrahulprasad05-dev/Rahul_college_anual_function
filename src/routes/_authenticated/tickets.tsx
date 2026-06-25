import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Navbar } from "@/components/Navbar";
import { Calendar, MapPin, CheckCircle2, Clock } from "lucide-react";

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
    events: { name: string; event_date: string } | null;
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
        .select("id, qr_token, status, price_cents, issued_at, used_at, items(name, starts_at, venue, events(name, event_date))")
        .eq("user_id", user!.id)
        .order("issued_at", { ascending: false });
      if (error) throw error;
      return data as unknown as TicketRow[];
    },
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">My Tickets</h1>
        <p className="text-muted-foreground mb-6">Show the QR code at the entry gate for scanning.</p>

        {isLoading ? (
          <div className="h-64 rounded-xl bg-card/40 animate-pulse" />
        ) : !tickets?.length ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
            No tickets yet. Browse events from the home page.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tickets.map((t) => (
              <div key={t.id} className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur overflow-hidden">
                <div className="p-6 border-b border-border/50">
                  <div className="text-xs text-muted-foreground">{t.items?.events?.name ?? "Event"}</div>
                  <h3 className="text-xl font-bold mt-0.5">{t.items?.name}</h3>
                  <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
                    {t.items?.starts_at && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(t.items.starts_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</span>}
                    {t.items?.venue && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{t.items.venue}</span>}
                    {!t.items?.starts_at && t.items?.events?.event_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(t.items.events.event_date).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div className="p-6 bg-white flex flex-col items-center justify-center">
                  <div className={`p-3 rounded-xl ${t.status === "used" ? "opacity-30" : ""}`}>
                    <QRCodeSVG value={t.qr_token} size={180} level="H" />
                  </div>
                  <div className="mt-3 text-center">
                    {t.status === "used" ? (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                        <CheckCircle2 className="w-3 h-3" />Used {t.used_at && new Date(t.used_at).toLocaleString()}
                      </span>
                    ) : t.status === "reserved" ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-accent/20 text-accent-foreground">Payment pending</span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-success/20 text-success">Valid · Ready to scan</span>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-2 font-mono">{t.qr_token.slice(0, 8)}…</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
