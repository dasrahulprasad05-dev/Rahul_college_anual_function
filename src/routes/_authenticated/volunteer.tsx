import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  doc,
  getDoc,
  collectionGroup,
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
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
      // 1. Fetch Assignments
      const assignsQ = query(collection(db, "event_volunteers"), where("user_id", "==", user!.id));
      const assignsSnap = await getDocs(assignsQ);
      const assignmentsRaw = assignsSnap.docs.map((d) => d.data());

      const eventIds = assignmentsRaw.map((a: any) => a.event_id as string);

      const assignments = await Promise.all(
        assignmentsRaw.map(async (a: any) => {
          const evSnap = await getDoc(doc(db, "events", a.event_id));
          return {
            event_id: a.event_id,
            events: evSnap.exists() ? ({ id: evSnap.id, ...evSnap.data() } as any) : null,
          };
        }),
      );

      // 2. Fetch Recent Scans
      const scansQ = query(
        collection(db, "tickets"),
        where("used_by", "==", user!.id),
        // Note: Firestore requires a composite index if combining equality and orderBy on different fields.
        // Assuming we just fetch used tickets by this volunteer and sort in memory if index missing.
      );
      const scansSnap = await getDocs(scansQ);
      let scans = scansSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as any);
      scans = scans
        .sort((a, b) => new Date(b.used_at).getTime() - new Date(a.used_at).getTime())
        .slice(0, 20);

      // Populate item/event for scans
      scans = await Promise.all(
        scans.map(async (s) => {
          const itemSnap = await getDoc(doc(db, `events/${s.event_id}/items/${s.item_id}`));
          const evSnap = await getDoc(doc(db, "events", s.event_id));
          return {
            ...s,
            items: {
              name: itemSnap.exists() ? itemSnap.data().name : "—",
              events: { name: evSnap.exists() ? evSnap.data().name : "" },
            },
          };
        }),
      );

      // 3. Stats by event
      const statsByEvent = new Map<string, { total: number; scanned: number }>();
      if (eventIds.length) {
        // Fetch all tickets for these events to calculate stats
        // We'll just fetch items for these events, then tickets
        for (const eid of eventIds) {
          const tQ = query(collection(db, "tickets"), where("event_id", "==", eid));
          const tSnap = await getDocs(tQ);
          let total = 0;
          let scanned = 0;
          tSnap.forEach((d) => {
            const status = d.data().status;
            if (status !== "cancelled") {
              total++;
              if (status === "used") scanned++;
            }
          });
          statsByEvent.set(eid, { total, scanned });
        }
      }

      return {
        assignments,
        scans,
        statsByEvent,
      };
    },
  });

  if (loading)
    return (
      <div className="min-h-screen">
        <Navbar />
      </div>
    );
  if (!isVolunteer) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto text-accent" />
          <h1 className="text-2xl font-bold mt-4">Volunteers only</h1>
          <p className="text-muted-foreground mt-2">Ask an admin to grant volunteer access.</p>
          <Button asChild className="mt-6">
            <Link to="/">Go home</Link>
          </Button>
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
            <Link to="/scan">
              <ScanLine className="w-4 h-4 mr-1.5" />
              Open scanner
            </Link>
          </Button>
        </div>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Assigned events
          </h2>
          {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
          {data && data.assignments.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground text-sm">
              No events assigned yet. An admin will assign you soon.
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-3">
            {data?.assignments.map((a: any) => {
              const e = a.events;
              if (!e) return null;
              const c = eventColors(e.id);
              const stats = data.statsByEvent.get(e.id) ?? { total: 0, scanned: 0 };
              const remaining = Math.max(stats.total - stats.scanned, 0);
              const pct = stats.total > 0 ? Math.round((stats.scanned / stats.total) * 100) : 0;
              return (
                <div
                  key={e.id}
                  className="rounded-2xl border border-border/60 bg-card/60 p-5 relative overflow-hidden"
                >
                  <div
                    className="absolute inset-x-0 top-0 h-1"
                    style={{ background: `hsl(${c.hue} 85% 60%)` }}
                  />
                  <h3 className="font-bold">{e.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {new Date(e.event_date).toLocaleDateString()} · {e.venue ?? "—"}
                  </p>
                  <div className="mt-3 flex items-center gap-4 text-sm">
                    <div>
                      <span className="font-bold text-lg">{stats.scanned}</span>{" "}
                      <span className="text-muted-foreground text-xs">scanned</span>
                    </div>
                    <div>
                      <span className="font-bold text-lg">{remaining}</span>{" "}
                      <span className="text-muted-foreground text-xs">remaining</span>
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: `hsl(${c.hue} 85% 60%)` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-success" />
            Recent scans
          </h2>
          {data && data.scans.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground text-sm">
              No scans yet.
            </div>
          )}
          <div className="rounded-2xl border border-border/60 bg-card/60 divide-y divide-border/40">
            {data?.scans.map((s: any) => {
              const item = s.items;
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
