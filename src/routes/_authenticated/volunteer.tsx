import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ScanLine, Calendar, CheckCircle2, Clock } from "lucide-react";
import { eventColors } from "@/lib/event-color";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_authenticated/volunteer")({
  component: VolunteerPage,
});

type Assignment = {
  event_id: string;
  events: { id: string; name: string; event_date: string; venue: string | null } | null;
};

function VolunteerPage() {
  const { user, isVolunteer, loading } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["volunteer-dashboard", user?.id],
    enabled: !!user && isVolunteer,
    queryFn: async () => {
      const [assignsRes, scansRes] = await Promise.all([
        supabase
          .from("event_volunteers")
          .select("event_id, events(id, name, event_date, venue)")
          .eq("user_id", user!.id),
        supabase
          .from("tickets")
          .select("id, used_at, item_id, items(name, event_id, events(name))")
          .eq("used_by", user!.id)
          .order("used_at", { ascending: false })
          .limit(20),
      ]);
      if (assignsRes.error) throw assignsRes.error;
      if (scansRes.error) throw scansRes.error;

      const assignments = (assignsRes.data ?? []) as unknown as Assignment[];
      const eventIds = assignments.map((a) => a.event_id);

      // per-event stats
      let statsByEvent = new Map<string, { total: number; scanned: number }>();
      if (eventIds.length) {
        const { data: items } = await supabase.from("items").select("id, event_id").in("event_id", eventIds);
        const itemIds = (items ?? []).map((i) => i.id);
        if (itemIds.length) {
          const { data: tickets } = await supabase
            .from("tickets")
            .select("item_id, status")
            .in("item_id", itemIds)
            .neq("status", "cancelled");
          const itemToEvent = new Map((items ?? []).map((i) => [i.id, i.event_id]));
          for (const t of tickets ?? []) {
            const eid = itemToEvent.get(t.item_id);
            if (!eid) continue;
            const s = statsByEvent.get(eid) ?? { total: 0, scanned: 0 };
            s.total += 1;
            if (t.status === "used") s.scanned += 1;
            statsByEvent.set(eid, s);
          }
        }
      }

      return {
        assignments,
        scans: scansRes.data ?? [],
        statsByEvent,
      };
    },
  });

  if (loading) return <div className="min-h-screen"><Navbar /></div>;
  if (!isVolunteer) {
    return (
      <div className="min-h-screen"><Navbar />
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto text-accent" />
          <h1 className="text-2xl font-bold mt-4">Volunteers only</h1>
          <p className="text-muted-foreground mt-2">Ask an admin to grant volunteer access.</p>
          <Button asChild className="mt-6"><Link to="/">Go home</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold">Volunteer</h1>
            <p className="text-muted-foreground">Your assigned events and recent scans.</p>
          </div>
          <Button asChild className="gradient-gold text-primary-foreground hover:opacity-90">
            <Link to="/scan"><ScanLine className="w-4 h-4 mr-1.5" />Open scanner</Link>
          </Button>
        </div>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />Assigned events
          </h2>
          {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
          {data && data.assignments.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground text-sm">
              No events assigned yet. An admin will assign you soon.
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-3">
            {data?.assignments.map((a) => {
              const e = a.events;
              if (!e) return null;
              const c = eventColors(e.id);
              const stats = data.statsByEvent.get(e.id) ?? { total: 0, scanned: 0 };
              const remaining = Math.max(stats.total - stats.scanned, 0);
              const pct = stats.total > 0 ? Math.round((stats.scanned / stats.total) * 100) : 0;
              return (
                <div key={e.id} className="rounded-2xl border border-border/60 bg-card/60 p-5 relative overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-1" style={{ background: `hsl(${c.hue} 85% 60%)` }} />
                  <h3 className="font-bold">{e.name}</h3>
                  <p className="text-xs text-muted-foreground">{new Date(e.event_date).toLocaleDateString()} · {e.venue ?? "—"}</p>
                  <div className="mt-3 flex items-center gap-4 text-sm">
                    <div><span className="font-bold text-lg">{stats.scanned}</span> <span className="text-muted-foreground text-xs">scanned</span></div>
                    <div><span className="font-bold text-lg">{remaining}</span> <span className="text-muted-foreground text-xs">remaining</span></div>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `hsl(${c.hue} 85% 60%)` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-success" />Recent scans
          </h2>
          {data && data.scans.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground text-sm">
              No scans yet.
            </div>
          )}
          <div className="rounded-2xl border border-border/60 bg-card/60 divide-y divide-border/40">
            {data?.scans.map((s) => {
              const item = s.items as unknown as { name: string; events: { name: string } | null } | null;
              return (
                <div key={s.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{item?.name ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">{item?.events?.name ?? ""}</div>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 tabular-nums">
                    <Clock className="w-3 h-3" />
                    {s.used_at ? formatDistanceToNow(new Date(s.used_at), { addSuffix: true }) : ""}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
