import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  BarChart, Bar, Cell, XAxis, YAxis, Tooltip, CartesianGrid,
  AreaChart, Area, Legend,
} from "recharts";
import { format, subDays, startOfDay } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { AlertTriangle, IndianRupee, Ticket, ScanLine, Users, TrendingUp, Calendar } from "lucide-react";
import { eventColors } from "@/lib/event-color";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

type EventRow = { id: string; name: string; event_date: string };
type ItemRow = { id: string; event_id: string; price_cents: number; capacity: number | null; booked_count: number };
type TicketRow = { id: string; item_id: string; status: "reserved" | "paid" | "used" | "cancelled"; price_cents: number; created_at: string; used_at: string | null };

const INR = (cents: number) => `₹${(cents / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

function DashboardPage() {
  const { isAdmin, loading, user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-data"],
    enabled: isAdmin,
    queryFn: async () => {
      const [evRes, itRes, tkRes, usrRes] = await Promise.all([
        supabase.from("events").select("id,name,event_date").order("event_date", { ascending: true }),
        supabase.from("items").select("id,event_id,price_cents,capacity,booked_count"),
        supabase.from("tickets").select("id,item_id,status,price_cents,created_at,used_at"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);
      if (evRes.error) throw evRes.error;
      if (itRes.error) throw itRes.error;
      if (tkRes.error) throw tkRes.error;
      return {
        events: (evRes.data ?? []) as EventRow[],
        items: (itRes.data ?? []) as ItemRow[],
        tickets: (tkRes.data ?? []) as TicketRow[],
        usersCount: usrRes.count ?? 0,
      };
    },
  });

  const stats = useMemo(() => {
    if (!data) return null;
    const { events, items, tickets, usersCount } = data;
    const itemToEvent = new Map(items.map((i) => [i.id, i.event_id]));
    const active = tickets.filter((t) => t.status !== "cancelled");

    const totalRevenueCents = active
      .filter((t) => t.status === "paid" || t.status === "used")
      .reduce((s, t) => s + t.price_cents, 0);

    const totalScans = tickets.filter((t) => t.status === "used").length;

    const capacity = items.reduce((s, i) => s + (i.capacity ?? 0), 0);
    const booked = items.reduce((s, i) => s + (i.booked_count ?? 0), 0);
    const fillRate = capacity > 0 ? Math.round((booked / capacity) * 100) : 0;

    // per-event aggregates
    const perEvent = events.map((e) => {
      const evItems = items.filter((i) => i.event_id === e.id);
      const evCapacity = evItems.reduce((s, i) => s + (i.capacity ?? 0), 0);
      const evBooked = evItems.reduce((s, i) => s + (i.booked_count ?? 0), 0);
      const evTickets = active.filter((t) => itemToEvent.get(t.item_id) === e.id);
      const evRevenue = evTickets
        .filter((t) => t.status === "paid" || t.status === "used")
        .reduce((s, t) => s + t.price_cents, 0);
      const evScans = evTickets.filter((t) => t.status === "used").length;
      const c = eventColors(e.id);
      return {
        id: e.id,
        name: e.name,
        short: e.name.length > 18 ? e.name.slice(0, 16) + "…" : e.name,
        date: e.event_date,
        registrations: evTickets.length,
        scans: evScans,
        revenue: evRevenue,
        capacity: evCapacity,
        booked: evBooked,
        fill: evCapacity > 0 ? Math.round((evBooked / evCapacity) * 100) : 0,
        color: `hsl(${c.hue} 85% 60%)`,
      };
    });

    // 14-day registrations timeseries
    const today = startOfDay(new Date());
    const days = Array.from({ length: 14 }, (_, i) => startOfDay(subDays(today, 13 - i)));
    const series = days.map((d) => {
      const next = new Date(d.getTime() + 86400000);
      const dayTickets = active.filter((t) => {
        const ts = new Date(t.created_at);
        return ts >= d && ts < next;
      });
      return {
        date: format(d, "MMM d"),
        registrations: dayTickets.length,
        revenue: dayTickets
          .filter((t) => t.status === "paid" || t.status === "used")
          .reduce((s, t) => s + t.price_cents, 0) / 100,
      };
    });

    return {
      totals: {
        revenue: totalRevenueCents,
        registrations: active.length,
        scans: totalScans,
        users: usersCount,
        fillRate,
      },
      perEvent: perEvent.sort((a, b) => b.registrations - a.registrations),
      series,
    };
  }, [data]);

  if (loading) return <div className="min-h-screen"><Navbar /></div>;

  if (!isAdmin) {
    return (
      <div className="min-h-screen"><Navbar />
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto text-accent" />
          <h1 className="text-2xl font-bold mt-4">Admin access required</h1>
          <p className="text-muted-foreground mt-2">You're signed in as <span className="font-mono text-xs">{user?.email}</span> but don't have the admin role.</p>
          <Button asChild className="mt-6"><Link to="/">Go home</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <TrendingUp className="w-7 h-7 text-primary" />Dashboard
            </h1>
            <p className="text-muted-foreground">Live analytics across all events.</p>
          </div>
          <Button asChild variant="outline"><Link to="/admin">Manage events →</Link></Button>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
          <Kpi icon={IndianRupee} label="Revenue" value={stats ? INR(stats.totals.revenue) : "—"} />
          <Kpi icon={Ticket} label="Registrations" value={stats?.totals.registrations ?? 0} />
          <Kpi icon={ScanLine} label="Check-ins" value={stats?.totals.scans ?? 0} />
          <Kpi icon={Users} label="Users" value={stats?.totals.users ?? 0} />
          <Kpi icon={Calendar} label="Fill rate" value={`${stats?.totals.fillRate ?? 0}%`} />
        </div>

        {isLoading && <div className="text-sm text-muted-foreground">Loading analytics…</div>}

        {stats && (
          <>
            {/* Registrations & revenue timeseries */}
            <Panel title="Last 14 days" subtitle="Daily registrations and revenue">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.series} margin={{ top: 10, right: 16, left: -8, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gReg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.45} />
                        <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <Tooltip content={<DarkTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Area type="monotone" dataKey="registrations" name="Registrations" stroke="hsl(var(--primary))" fill="url(#gReg)" strokeWidth={2} />
                    <Area type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="hsl(var(--accent))" fill="url(#gRev)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <div className="grid lg:grid-cols-2 gap-6 mt-6">
              <Panel title="Registrations per event" subtitle="Total active tickets per event">
                <ChartHorizontal data={stats.perEvent} dataKey="registrations" />
              </Panel>
              <Panel title="Revenue per event" subtitle="Paid + used tickets, in ₹">
                <ChartHorizontal data={stats.perEvent} dataKey="revenue" valueFormatter={(v) => INR(v)} />
              </Panel>
            </div>

            <Panel className="mt-6" title="Check-ins per event" subtitle="Scanned tickets at the gate">
              <ChartHorizontal data={stats.perEvent} dataKey="scans" />
            </Panel>

            {/* Per-event table */}
            <Panel className="mt-6" title="Event breakdown" subtitle="Tap an event to manage it">
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-3 py-2">Event</th>
                      <th className="px-3 py-2 text-right">Registered</th>
                      <th className="px-3 py-2 text-right">Scanned</th>
                      <th className="px-3 py-2 text-right">Revenue</th>
                      <th className="px-3 py-2 text-right">Fill</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.perEvent.map((e) => (
                      <tr key={e.id} className="border-t border-border/40 hover:bg-card/60 transition">
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-6 rounded-full" style={{ background: e.color }} />
                            <div>
                              <Link to="/events/$eventId" params={{ eventId: e.id }} className="font-medium hover:underline">{e.name}</Link>
                              <div className="text-xs text-muted-foreground">{new Date(e.date).toLocaleDateString()}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{e.registrations}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{e.scans}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{INR(e.revenue)}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">
                          {e.capacity > 0 ? (
                            <span className={e.fill >= 90 ? "text-destructive" : e.fill >= 60 ? "text-accent" : "text-muted-foreground"}>
                              {e.fill}%
                            </span>
                          ) : <span className="text-muted-foreground">—</span>}
                        </td>
                      </tr>
                    ))}
                    {stats.perEvent.length === 0 && (
                      <tr><td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">No events yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Panel>
          </>
        )}
      </div>
    </div>
  );
}

function Kpi({ icon: Icon, label, value }: { icon: typeof Ticket; label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-5">
      <Icon className="w-5 h-5 text-primary mb-2" />
      <div className="text-2xl md:text-3xl font-bold tracking-tight">{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

function Panel({ title, subtitle, children, className = "" }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-border/60 bg-card/60 p-5 ${className}`}>
      <header className="mb-4">
        <h2 className="text-base font-semibold">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </header>
      {children}
    </section>
  );
}

type ChartRow = { id: string; short: string; color: string; [k: string]: string | number };

function ChartHorizontal({ data, dataKey, valueFormatter }: { data: ChartRow[]; dataKey: string; valueFormatter?: (v: number) => string }) {
  const rows = data.slice(0, 10);
  const height = Math.max(220, rows.length * 34 + 40);
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" opacity={0.4} />
          <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={valueFormatter} />
          <YAxis type="category" dataKey="short" width={120} stroke="hsl(var(--muted-foreground))" fontSize={11} />
          <Tooltip content={<DarkTooltip valueFormatter={valueFormatter} />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }} />
          <Bar dataKey={dataKey} radius={[0, 6, 6, 0]}>
            {rows.map((r) => (
              <Cell key={r.id} fill={r.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function DarkTooltip({ active, payload, label, valueFormatter }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
  valueFormatter?: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border/60 bg-background/95 backdrop-blur px-3 py-2 text-xs shadow-lg">
      <div className="font-medium mb-1">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-medium tabular-nums">{valueFormatter ? valueFormatter(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  );
}
