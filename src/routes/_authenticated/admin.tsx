import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { AlertTriangle, Calendar, Plus, Ticket, Users, ScanLine, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
});

function AdminPage() {
  const { isAdmin, loading, user } = useAuth();
  const qc = useQueryClient();

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    enabled: isAdmin,
    queryFn: async () => {
      const [events, tickets, used, users] = await Promise.all([
        supabase.from("events").select("id", { count: "exact", head: true }),
        supabase.from("tickets").select("id", { count: "exact", head: true }),
        supabase.from("tickets").select("id", { count: "exact", head: true }).eq("status", "used"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);
      return {
        events: events.count ?? 0,
        tickets: tickets.count ?? 0,
        used: used.count ?? 0,
        users: users.count ?? 0,
      };
    },
  });

  const { data: events } = useQuery({
    queryKey: ["admin-events"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*, items(id, name, price_cents)")
        .order("event_date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const createEvent = useMutation({
    mutationFn: async (vals: { name: string; description: string; event_date: string; venue: string }) => {
      const { error } = await supabase.from("events").insert(vals);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-events"] }); qc.invalidateQueries({ queryKey: ["events"] }); toast.success("Event created"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const createItem = useMutation({
    mutationFn: async (vals: { event_id: string; name: string; description: string; starts_at: string | null; venue: string; price_cents: number; category: string }) => {
      const { error } = await supabase.from("items").insert(vals);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-events"] }); toast.success("Item added"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-events"] }); qc.invalidateQueries({ queryKey: ["events"] }); toast.success("Event deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (loading) return <div className="min-h-screen"><Navbar /></div>;

  if (!isAdmin) {
    return (
      <div className="min-h-screen"><Navbar />
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto text-accent" />
          <h1 className="text-2xl font-bold mt-4">Admin access required</h1>
          <p className="text-muted-foreground mt-2">You're signed in but don't have admin role yet.</p>
          <div className="mt-6 rounded-xl bg-card/60 border border-border p-4 text-left text-sm">
            <p className="font-semibold mb-2">Bootstrap your first admin:</p>
            <p className="text-muted-foreground">In the backend SQL editor, run:</p>
            <pre className="mt-2 text-xs bg-background/60 p-3 rounded font-mono overflow-auto">{`INSERT INTO user_roles(user_id, role)
VALUES ('${user?.id ?? "YOUR_USER_ID"}', 'admin');`}</pre>
          </div>
          <Button asChild className="mt-6"><Link to="/">Go home</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Admin</h1>
            <p className="text-muted-foreground">Manage events, items, and check-ins.</p>
          </div>
          <NewEventDialog onCreate={(v) => createEvent.mutate(v)} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <StatCard icon={Calendar} label="Events" value={stats?.events ?? 0} />
          <StatCard icon={Ticket} label="Tickets sold" value={stats?.tickets ?? 0} />
          <StatCard icon={ScanLine} label="Checked in" value={stats?.used ?? 0} />
          <StatCard icon={Users} label="Users" value={stats?.users ?? 0} />
        </div>

        {/* Events */}
        <div className="space-y-4">
          {events?.map((e) => (
            <div key={e.id} className="rounded-2xl border border-border/60 bg-card/60 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold">{e.name}</h3>
                  <p className="text-sm text-muted-foreground">{new Date(e.event_date).toLocaleDateString()} · {e.venue}</p>
                </div>
                <div className="flex gap-2">
                  <NewItemDialog eventId={e.id} onCreate={(v) => createItem.mutate(v)} />
                  <Button variant="ghost" size="icon" onClick={() => { if (confirm("Delete this event and all its items/tickets?")) deleteEvent.mutate(e.id); }}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {e.items?.length ? e.items.map((it) => (
                  <div key={it.id} className="flex items-center justify-between rounded-lg bg-background/40 px-3 py-2 text-sm">
                    <span>{it.name}</span>
                    <span className="text-muted-foreground">{it.price_cents === 0 ? "Free" : `₹${(it.price_cents / 100).toFixed(0)}`}</span>
                  </div>
                )) : <p className="text-xs text-muted-foreground">No items yet — add one.</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Calendar; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-5">
      <Icon className="w-5 h-5 text-primary mb-2" />
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function NewEventDialog({ onCreate }: { onCreate: (v: { name: string; description: string; event_date: string; venue: string }) => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", event_date: "", venue: "" });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gradient-gold text-primary-foreground hover:opacity-90"><Plus className="w-4 h-4 mr-1.5" />New event</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Create event</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Date</Label><Input type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} /></div>
            <div><Label>Venue</Label><Input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} /></div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => { onCreate(form); setOpen(false); setForm({ name: "", description: "", event_date: "", venue: "" }); }} disabled={!form.name || !form.event_date}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NewItemDialog({ eventId, onCreate }: { eventId: string; onCreate: (v: { event_id: string; name: string; description: string; starts_at: string | null; venue: string; price_cents: number; category: string }) => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", starts_at: "", venue: "", price: "0", category: "" });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="outline" size="sm"><Plus className="w-3 h-3 mr-1" />Item</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add item</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Category</Label><Input placeholder="Dance, Music…" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
            <div><Label>Price (₹)</Label><Input type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Starts at</Label><Input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} /></div>
            <div><Label>Venue</Label><Input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} /></div>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              onCreate({
                event_id: eventId,
                name: form.name,
                description: form.description,
                starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
                venue: form.venue,
                price_cents: Math.round(parseFloat(form.price || "0") * 100),
                category: form.category,
              });
              setOpen(false);
              setForm({ name: "", description: "", starts_at: "", venue: "", price: "0", category: "" });
            }}
            disabled={!form.name}
          >Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
