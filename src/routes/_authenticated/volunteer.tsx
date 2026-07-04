import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  ScanLine,
  Calendar,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  Users,
  UserCheck,
  UserX,
} from "lucide-react";
import { eventColors } from "@/lib/event-color";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/_authenticated/volunteer")({
  component: VolunteerPage,
});

type StudentEntry = {
  ticketId: string;
  userId: string;
  userEmail: string;
  itemName: string;
  status: "paid" | "used" | "cancelled";
  usedAt?: string;
  createdAt: string;
};

type EventData = {
  id: string;
  name: string;
  event_date: string;
  venue: string | null;
};

type AssignedEvent = {
  event: EventData;
  students: StudentEntry[];
  scanned: number;
  total: number;
};

function VolunteerPage() {
  const { user, isVolunteer, loading } = useAuth();
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["volunteer-dashboard", user?.id],
    enabled: !!user && isVolunteer,
    queryFn: async () => {
      // 1. Fetch volunteer's event assignments
      const assignsQ = query(
        collection(db, "event_volunteers"),
        where("user_id", "==", user!.id),
      );
      const assignsSnap = await getDocs(assignsQ);
      const assignedEventIds = assignsSnap.docs.map(
        (d) => d.data().event_id as string,
      );

      if (assignedEventIds.length === 0) {
        return { assignedEvents: [], recentScans: [] };
      }

      // 2. Fetch event details + all tickets per event
      const assignedEvents: AssignedEvent[] = await Promise.all(
        assignedEventIds.map(async (eventId) => {
          const evSnap = await getDoc(doc(db, "events", eventId));
          const eventData: EventData = evSnap.exists()
            ? ({ id: evSnap.id, ...evSnap.data() } as EventData)
            : { id: eventId, name: "Unknown Event", event_date: "", venue: null };

          // Fetch all non-cancelled tickets for this event
          const ticketsQ = query(
            collection(db, "tickets"),
            where("event_id", "==", eventId),
          );
          const ticketsSnap = await getDocs(ticketsQ);
          const students: StudentEntry[] = ticketsSnap.docs
            .map((d) => {
              const t = d.data();
              return {
                ticketId: d.id,
                userId: t.user_id ?? "",
                userEmail: t.user_email ?? "Unknown",
                itemName: t.item_name ?? "Ticket",
                status: t.status as "paid" | "used" | "cancelled",
                usedAt: t.used_at,
                createdAt: t.created_at ?? "",
              };
            })
            .filter((s) => s.status !== "cancelled")
            // Sort: unscanned first, then scanned
            .sort((a, b) => {
              if (a.status === "used" && b.status !== "used") return 1;
              if (a.status !== "used" && b.status === "used") return -1;
              return a.userEmail.localeCompare(b.userEmail);
            });

          const scanned = students.filter((s) => s.status === "used").length;

          return {
            event: eventData,
            students,
            scanned,
            total: students.length,
          };
        }),
      );

      // 3. Fetch recent scans done by this volunteer
      const scansQ = query(
        collection(db, "tickets"),
        where("used_by", "==", user!.id),
      );
      const scansSnap = await getDocs(scansQ);
      let recentScans = scansSnap.docs
        .map((d) => ({ id: d.id, ...d.data() }) as any)
        .sort(
          (a, b) => new Date(b.used_at).getTime() - new Date(a.used_at).getTime(),
        )
        .slice(0, 20);

      return { assignedEvents, recentScans };
    },
  });

  function toggleEvent(eventId: string) {
    setExpandedEvents((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) next.delete(eventId);
      else next.add(eventId);
      return next;
    });
  }

  function setEventSearch(eventId: string, val: string) {
    setSearch((prev) => ({ ...prev, [eventId]: val }));
  }

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
          <p className="text-muted-foreground mt-2">
            Ask an admin to grant volunteer access.
          </p>
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="w-7 h-7 text-primary" />
              Volunteer Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Your assigned events · registered students · scan status
            </p>
          </div>
          <Button
            asChild
            className="gradient-gold text-primary-foreground hover:opacity-90"
          >
            <Link to="/scan">
              <ScanLine className="w-4 h-4 mr-1.5" />
              Open Scanner
            </Link>
          </Button>
        </div>

        {/* Assigned Events */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Assigned Events
          </h2>

          {isLoading && (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-32 rounded-2xl bg-card/40 animate-pulse" />
              ))}
            </div>
          )}

          {data && data.assignedEvents.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
              No events assigned yet. An admin will assign you to events soon.
            </div>
          )}

          <div className="space-y-4">
            {data?.assignedEvents.map((ae) => {
              const c = eventColors(ae.event.id);
              const pct =
                ae.total > 0 ? Math.round((ae.scanned / ae.total) * 100) : 0;
              const isExpanded = expandedEvents.has(ae.event.id);
              const q = (search[ae.event.id] ?? "").toLowerCase();
              const filteredStudents = ae.students.filter(
                (s) =>
                  !q ||
                  s.userEmail.toLowerCase().includes(q) ||
                  s.itemName.toLowerCase().includes(q),
              );

              return (
                <div
                  key={ae.event.id}
                  className="rounded-2xl border border-border/60 bg-card/60 overflow-hidden"
                >
                  {/* Colour bar */}
                  <div
                    className="h-1 w-full"
                    style={{ background: `hsl(${c.hue} 85% 60%)` }}
                  />

                  {/* Event summary row */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg truncate">
                          {ae.event.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {ae.event.event_date
                            ? new Date(ae.event.event_date).toLocaleDateString(
                                "en-IN",
                                { day: "numeric", month: "short", year: "numeric" },
                              )
                            : "Date TBA"}{" "}
                          · {ae.event.venue ?? "Venue TBA"}
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-center">
                          <div
                            className="text-2xl font-bold"
                            style={{ color: `hsl(${c.hue} 85% 60%)` }}
                          >
                            {ae.scanned}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            scanned
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-amber-400">
                            {ae.total - ae.scanned}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            remaining
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{ae.total}</div>
                          <div className="text-xs text-muted-foreground">
                            total
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-4 h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: `hsl(${c.hue} 85% 60%)` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {pct}% checked in
                    </div>

                    {/* Toggle button */}
                    <button
                      onClick={() => toggleEvent(ae.event.id)}
                      className="mt-4 flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          Hide student list
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          View {ae.total} registered students
                        </>
                      )}
                    </button>
                  </div>

                  {/* Expandable student list */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-border/40 px-5 pb-5 pt-4">
                          {/* Search */}
                          <input
                            type="text"
                            placeholder="Search by email or item…"
                            value={search[ae.event.id] ?? ""}
                            onChange={(e) =>
                              setEventSearch(ae.event.id, e.target.value)
                            }
                            className="w-full mb-4 px-3 py-2 text-sm rounded-lg bg-background/60 border border-border/60 placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                          />

                          {/* Legend */}
                          <div className="flex gap-4 mb-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <UserX className="w-3.5 h-3.5 text-amber-400" />
                              Not yet scanned (shown first)
                            </span>
                            <span className="flex items-center gap-1">
                              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                              Scanned
                            </span>
                          </div>

                          {/* Student rows */}
                          <div className="rounded-xl border border-border/40 divide-y divide-border/30 overflow-hidden">
                            {filteredStudents.length === 0 && (
                              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                                No students match your search.
                              </div>
                            )}
                            {filteredStudents.map((s) => {
                              const isScanned = s.status === "used";
                              return (
                                <div
                                  key={s.ticketId}
                                  className={`flex items-center justify-between px-4 py-3 gap-3 transition-colors ${
                                    isScanned
                                      ? "bg-emerald-950/20"
                                      : "bg-amber-950/20"
                                  }`}
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    {isScanned ? (
                                      <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                                    ) : (
                                      <UserX className="w-4 h-4 text-amber-400 shrink-0" />
                                    )}
                                    <div className="min-w-0">
                                      <div className="text-sm font-medium truncate">
                                        {s.userEmail}
                                      </div>
                                      <div className="text-xs text-muted-foreground truncate">
                                        {s.itemName}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="shrink-0">
                                    {isScanned ? (
                                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">
                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                        Scanned
                                        {s.usedAt
                                          ? ` · ${formatDistanceToNow(
                                              new Date(s.usedAt),
                                              { addSuffix: true },
                                            )}`
                                          : ""}
                                      </Badge>
                                    ) : (
                                      <Badge
                                        variant="outline"
                                        className="text-amber-300 border-amber-500/40 bg-amber-500/10 text-[10px]"
                                      >
                                        Not yet scanned
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* Recent Scans */}
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Recent Scans by You
          </h2>

          {data && data.recentScans.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground text-sm">
              No scans yet. Use the scanner to check in students.
            </div>
          )}

          {data && data.recentScans.length > 0 && (
            <div className="rounded-2xl border border-border/60 bg-card/60 divide-y divide-border/40">
              {data.recentScans.map((s: any) => (
                <div
                  key={s.id}
                  className="px-4 py-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="font-medium text-sm truncate">
                      {s.user_email ?? "—"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {s.item_name ?? "Ticket"} · {s.event_name ?? ""}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 shrink-0 tabular-nums">
                    <Clock className="w-3 h-3" />
                    {s.used_at
                      ? formatDistanceToNow(new Date(s.used_at), {
                          addSuffix: true,
                        })
                      : ""}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
