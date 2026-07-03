import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/lib/firebase";
import {
  collection,
  getCountFromServer,
  query,
  where,
  getDocs,
  collectionGroup,
} from "firebase/firestore";
import { eventsService, AppEvent } from "@/services/firestore/events";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  Calendar,
  Plus,
  Ticket,
  Users,
  ScanLine,
  Trash2,
  Pencil,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { TeamManager } from "@/components/admin/TeamManager";

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
      <div className="min-h-screen">
        <Navbar />
      </div>
    );

  if (!isAdmin) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto text-accent" />
          <h1 className="text-2xl font-bold mt-4">Admin access required</h1>
          <p className="text-muted-foreground mt-2">
            You're signed in but don't have admin role yet.
          </p>
          <div className="mt-6 rounded-xl bg-card/60 border border-border p-4 text-left text-sm">
            <p className="font-semibold mb-2">Bootstrap your first admin:</p>
            <p className="text-muted-foreground">In the backend SQL editor, run:</p>
            <pre className="mt-2 text-xs bg-background/60 p-3 rounded font-mono overflow-auto">{`INSERT INTO user_roles(user_id, role)
VALUES ('${user?.id ?? "YOUR_USER_ID"}', 'admin');`}</pre>
          </div>
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
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Admin</h1>
            <p className="text-muted-foreground">Manage events, items, and check-ins.</p>
          </div>
          <EventDialog
            mode="create"
            onSubmit={(v) => createEvent.mutate(v)}
            trigger={
              <Button className="gradient-gold text-primary-foreground hover:opacity-90">
                <Plus className="w-4 h-4 mr-1.5" />
                New event
              </Button>
            }
          />
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
          {!events?.length && (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
              No events yet. Click <span className="text-foreground font-medium">New event</span> to
              create one.
            </div>
          )}
          {events?.map((e) => (
            <div key={e.id} className="rounded-2xl border border-border/60 bg-card/60 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold">{e.name}</h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${e.is_published ? "border-success/40 bg-success/10 text-success" : "border-border bg-muted text-muted-foreground"}`}
                    >
                      {e.is_published ? "Published" : "Draft"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(e.event_date).toLocaleDateString()} · {e.venue ?? "—"}
                  </p>
                  {e.description && (
                    <p className="text-sm text-muted-foreground mt-2 max-w-2xl">{e.description}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateEvent.mutate({ id: e.id, vals: { is_published: !e.is_published } })
                    }
                  >
                    {e.is_published ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5 mr-1" />
                        Unpublish
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Publish
                      </>
                    )}
                  </Button>
                  <EventDialog
                    mode="edit"
                    initial={{
                      name: e.name,
                      description: e.description ?? "",
                      event_date: e.event_date,
                      venue: e.venue ?? "",
                      is_published: e.is_published,
                    }}
                    onSubmit={(vals) => updateEvent.mutate({ id: e.id, vals })}
                    trigger={
                      <Button variant="ghost" size="icon">
                        <Pencil className="w-4 h-4" />
                      </Button>
                    }
                  />
                  <NewItemDialog eventId={e.id} onCreate={(v) => createItem.mutate(v)} />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm("Delete this event and all its items/tickets?"))
                        deleteEvent.mutate(e.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {e.items?.length ? (
                  e.items.map((it) => (
                    <div
                      key={it.id}
                      className="flex items-center justify-between rounded-lg bg-background/40 px-3 py-2 text-sm"
                    >
                      <span>{it.name}</span>
                      <span className="text-muted-foreground">
                        {it.price_cents === 0 ? "Free" : `₹${(it.price_cents / 100).toFixed(0)}`}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">No items yet — add one.</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <TeamManager />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Calendar;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-5">
      <Icon className="w-5 h-5 text-primary mb-2" />
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function EventDialog({
  mode,
  initial,
  onSubmit,
  trigger,
}: {
  mode: "create" | "edit";
  initial?: EventForm;
  onSubmit: (v: EventForm) => void;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<EventForm>(initial ?? emptyEvent);
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setForm(initial ?? emptyEvent);
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create event" : "Edit event"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={form.event_date?.slice(0, 10)}
                onChange={(e) => setForm({ ...form, event_date: e.target.value })}
              />
            </div>
            <div>
              <Label>Venue</Label>
              <Input
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
              />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
            <div>
              <Label className="text-sm">Published</Label>
              <p className="text-xs text-muted-foreground">Visible to students on the home page.</p>
            </div>
            <Switch
              checked={form.is_published}
              onCheckedChange={(v) => setForm({ ...form, is_published: v })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              onSubmit(form);
              setOpen(false);
            }}
            disabled={!form.name || !form.event_date}
          >
            {mode === "create" ? "Create" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NewItemDialog({
  eventId,
  onCreate,
}: {
  eventId: string;
  onCreate: (v: {
    event_id: string;
    name: string;
    description: string;
    starts_at: string | undefined;
    venue: string;
    price_cents: number;
    category: string;
  }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    starts_at: "",
    venue: "",
    price: "0",
    category: "",
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="w-3 h-3 mr-1" />
          Item
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add item</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Category</Label>
              <Input
                placeholder="Dance, Music…"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>
            <div>
              <Label>Price (₹)</Label>
              <Input
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Starts at</Label>
              <Input
                type="datetime-local"
                value={form.starts_at}
                onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
              />
            </div>
            <div>
              <Label>Venue</Label>
              <Input
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              onCreate({
                event_id: eventId,
                name: form.name,
                description: form.description,
                starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : undefined,
                venue: form.venue,
                price_cents: Math.round(parseFloat(form.price || "0") * 100),
                category: form.category,
              });
              setOpen(false);
              setForm({
                name: "",
                description: "",
                starts_at: "",
                venue: "",
                price: "0",
                category: "",
              });
            }}
            disabled={!form.name}
          >
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
