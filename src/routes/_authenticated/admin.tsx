import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/lib/firebase";
import { collection, getCountFromServer, query, where, getDocs, collectionGroup } from "firebase/firestore";
import { eventsService, type EventItem } from "@/services/firestore/events";
import { useAuth } from "@/context/AuthContext";
import { TeamManager } from "@/components/admin/TeamManager";
import { GatePassManager } from "@/components/admin/GatePassManager";
import { seedDatabase } from "@/lib/seed-data";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetDescription } from "@/components/ui/sheet";
import { AlertTriangle, Calendar, Plus, Ticket, Users, ScanLine, Trash2, Pencil, Eye, EyeOff, LayoutDashboard, Shield, ShieldCheck, Sparkles, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
});

type EventForm = {
  name: string;
  description: string;
  event_date: string;
  venue: string;
  is_published: boolean;
};
type EventRow = {
  id: string;
  name: string;
  description: string | null;
  event_date: string;
  venue: string | null;
  is_published: boolean;
  items?: { id: string; name: string; price_cents: number }[];
};

const emptyEvent: EventForm = {
  name: "",
  description: "",
  event_date: "",
  venue: "",
  is_published: false,
};

function AdminPage() {
  const { isAdmin, loading, user } = useAuth();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<"dashboard" | "team" | "gate">("dashboard");

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    enabled: isAdmin,
    queryFn: async () => {
      const [events, tickets, used, users] = await Promise.all([
        getCountFromServer(collection(db, "events")),
        getCountFromServer(collection(db, "tickets")),
        getCountFromServer(query(collection(db, "tickets"), where("status", "==", "used"))),
        getCountFromServer(collection(db, "users")),
      ]);
      return {
        events: events.data().count ?? 0,
        tickets: tickets.data().count ?? 0,
        used: used.data().count ?? 0,
        users: users.data().count ?? 0,
      };
    },
  });

  const { data: events } = useQuery({
    queryKey: ["admin-events"],
    enabled: isAdmin,
    queryFn: async () => {
      const evs = await eventsService.getEvents(false);
      const itemsSnap = await getDocs(collectionGroup(db, "items"));
      const allItems = itemsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      return evs.map((e) => ({
        ...e,
        items: allItems.filter((i) => (i as any).event_id === e.id) as any,
      })) as EventRow[];
    },
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-events"] });
    qc.invalidateQueries({ queryKey: ["events"] });
  };

  const createEvent = useMutation({
    mutationFn: async (vals: EventForm) => {
      await eventsService.createEvent({
        ...vals,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      invalidate();
      toast.success("Event created");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateEvent = useMutation({
    mutationFn: async ({ id, vals }: { id: string; vals: Partial<EventForm> }) => {
      await eventsService.updateEvent(id, {
        ...vals,
        updated_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      invalidate();
      toast.success("Event updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const createItem = useMutation({
    mutationFn: async (vals: {
      event_id: string;
      name: string;
      description: string;
      starts_at: string | undefined;
      venue: string;
      price_cents: number;
      category: string;
    }) => {
      const { event_id, ...data } = vals;
      await eventsService.createEventItem(event_id, {
        ...data,
        booked_count: 0,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-events"] });
      toast.success("Item added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      await eventsService.deleteEvent(id);
    },
    onSuccess: () => {
      invalidate();
      toast.success("Event deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto text-accent mb-4" />
          <h1 className="text-2xl font-display font-bold">Admin access required</h1>
          <p className="text-muted-foreground mt-2">
            You're signed in but don't have admin role yet.
          </p>
          <div className="mt-8 rounded-2xl bg-card/40 border border-border/60 p-6 text-left text-sm backdrop-blur">
            <p className="font-semibold mb-2">Bootstrap your first admin:</p>
            <p className="text-muted-foreground mb-4">In the backend SQL editor, run:</p>
            <pre className="text-xs bg-background p-4 rounded-xl font-mono overflow-auto border border-white/5">{`INSERT INTO user_roles(user_id, role)
VALUES ('${user?.id ?? "YOUR_USER_ID"}', 'admin');`}</pre>
          </div>
          <Button asChild className="mt-8 h-12 px-8 gradient-gold">
            <Link to="/">Go home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "team", label: "Team", icon: Users },
    { id: "gate", label: "Gate Passes", icon: ShieldCheck },
  ] as const;

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border/40 bg-card/30 backdrop-blur-xl h-screen sticky top-0 shrink-0">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2 group mb-10">
            <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight">Festa Admin</span>
          </Link>
          <nav className="space-y-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === t.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"}`}
              >
                <t.icon className={`w-5 h-5 ${activeTab === t.id ? "text-primary" : ""}`} />
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pb-24 md:pb-12 min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-border/40 bg-background/80 backdrop-blur sticky top-0 z-20">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-gold flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold">Festa</span>
          </Link>
        </header>

        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-display font-bold">Events Dashboard</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Manage events, check statistics, and view items.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => seedDatabase()} className="bg-white/5">
                      Seed Demo Data
                    </Button>
                    <EventSheet
                      mode="create"
                      onSubmit={(v) => createEvent.mutate(v)}
                      trigger={
                        <Button className="gradient-gold text-primary-foreground">
                          <Plus className="w-4 h-4 mr-2" />
                          New Event
                        </Button>
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard icon={Calendar} label="Events" value={stats?.events ?? 0} color="var(--neon-cyan)" />
                  <StatCard icon={Ticket} label="Tickets sold" value={stats?.tickets ?? 0} color="var(--neon-pink)" />
                  <StatCard icon={ScanLine} label="Checked in" value={stats?.used ?? 0} color="var(--neon-yellow)" />
                  <StatCard icon={Users} label="Users" value={stats?.users ?? 0} color="#a855f7" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {events?.map((e) => (
                    <div key={e.id} className="group rounded-2xl border border-white/10 bg-card/40 backdrop-blur-xl p-5 hover:border-primary/30 transition-all flex flex-col justify-between h-full relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-lg font-bold font-display uppercase tracking-tight">{e.name}</h3>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem onClick={() => updateEvent.mutate({ id: e.id, vals: { is_published: !e.is_published } })}>
                                {e.is_published ? <><EyeOff className="w-4 h-4 mr-2"/> Unpublish</> : <><Eye className="w-4 h-4 mr-2"/> Publish</>}
                              </DropdownMenuItem>
                              <EventSheet
                                mode="edit"
                                initial={{ name: e.name, description: e.description ?? "", event_date: e.event_date, venue: e.venue ?? "", is_published: e.is_published }}
                                onSubmit={(vals) => updateEvent.mutate({ id: e.id, vals })}
                                trigger={
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Pencil className="w-4 h-4 mr-2"/> Edit
                                  </DropdownMenuItem>
                                }
                              />
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => { if (confirm("Delete this event?")) deleteEvent.mutate(e.id); }}>
                                <Trash2 className="w-4 h-4 mr-2"/> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="flex items-center gap-2 mt-1 mb-3">
                          <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full border ${e.is_published ? "border-success/30 bg-success/10 text-success" : "border-white/10 bg-white/5 text-muted-foreground"}`}>
                            {e.is_published ? "Live" : "Draft"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(e.event_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        {e.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{e.description}</p>
                        )}
                      </div>

                      <div>
                        <div className="space-y-2 mb-4">
                          {e.items?.length ? (
                            e.items.map((it) => (
                              <div key={it.id} className="flex justify-between items-center text-sm p-2 rounded-lg bg-white/5 border border-white/5">
                                <span className="truncate pr-2">{it.name}</span>
                                <span className="shrink-0 font-medium text-primary">
                                  {it.price_cents === 0 ? "Free" : `₹${(it.price_cents / 100).toFixed(0)}`}
                                </span>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-muted-foreground italic py-2">No items yet</p>
                          )}
                        </div>
                        <NewItemDialog eventId={e.id} onCreate={(v) => createItem.mutate(v)} />
                      </div>
                    </div>
                  ))}
                  {events?.length === 0 && (
                     <div className="col-span-full rounded-2xl border border-dashed border-border p-12 text-center flex flex-col items-center">
                        <Calendar className="w-8 h-8 text-muted-foreground mb-3 opacity-50" />
                        <p className="text-muted-foreground">No events found. Start by creating one.</p>
                     </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "team" && (
              <motion.div key="team" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <TeamManager />
              </motion.div>
            )}

            {activeTab === "gate" && (
              <motion.div key="gate" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <GatePassManager />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 w-full border-t border-border/40 bg-card/60 backdrop-blur-xl z-50 px-6 py-3 flex justify-between items-center safe-area-bottom">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex flex-col items-center gap-1 p-2 transition-colors ${activeTab === t.id ? "text-primary" : "text-muted-foreground"}`}
          >
            <t.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <div className="relative rounded-2xl border border-white/10 bg-card/40 backdrop-blur-md p-5 overflow-hidden group">
      <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" style={{ background: color }} />
      <Icon className="w-6 h-6 mb-3" style={{ color }} />
      <div className="text-3xl font-display font-bold">{value}</div>
      <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-semibold">{label}</div>
    </div>
  );
}

function EventSheet({ mode, initial, onSubmit, trigger }: { mode: "create" | "edit"; initial?: EventForm; onSubmit: (v: EventForm) => void; trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<EventForm>(initial ?? emptyEvent);

  return (
    <Sheet open={open} onOpenChange={(o) => { setOpen(o); if (o) setForm(initial ?? emptyEvent); }}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="sm:max-w-md overflow-y-auto bg-background/95 backdrop-blur-2xl border-white/10">
        <SheetHeader>
          <SheetTitle className="font-display uppercase tracking-tight text-xl">{mode === "create" ? "Create New Event" : "Edit Event"}</SheetTitle>
          <SheetDescription>Set up the details for this event below.</SheetDescription>
        </SheetHeader>
        <div className="space-y-5 py-6">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-white/5 border-white/10" placeholder="e.g. Battle of Bands" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-white/5 border-white/10 h-24" placeholder="Brief details about the event..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={form.event_date?.slice(0, 10)} onChange={(e) => setForm({ ...form, event_date: e.target.value })} className="bg-white/5 border-white/10 [color-scheme:dark]" />
            </div>
            <div className="space-y-2">
              <Label>Venue</Label>
              <Input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} className="bg-white/5 border-white/10" placeholder="e.g. Main Aud." />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
            <div>
              <Label className="text-base font-medium">Published</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Make visible to all students.</p>
            </div>
            <Switch checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} />
          </div>
        </div>
        <SheetFooter className="mt-4">
          <Button onClick={() => { onSubmit(form); setOpen(false); }} disabled={!form.name || !form.event_date} className="w-full gradient-gold">
            {mode === "create" ? "Create Event" : "Save Changes"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function NewItemDialog({ eventId, onCreate }: { eventId: string; onCreate: (v: any) => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", starts_at: "", venue: "", price: "0", category: "" });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full border-dashed border-white/20 hover:border-primary/50 hover:bg-primary/10">
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Event Item</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Solo Dance" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Input placeholder="Dance, Music…" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Price (₹)</Label>
              <Input type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Starts at</Label>
              <Input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} className="[color-scheme:dark]" />
            </div>
            <div className="space-y-1.5">
              <Label>Venue</Label>
              <Input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} placeholder="e.g. Stage 1" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => {
            onCreate({
              event_id: eventId, name: form.name, description: form.description,
              starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : undefined,
              venue: form.venue, price_cents: Math.round(parseFloat(form.price || "0") * 100), category: form.category
            });
            setOpen(false);
            setForm({ name: "", description: "", starts_at: "", venue: "", price: "0", category: "" });
          }} disabled={!form.name} className="gradient-gold w-full">
            Add Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
