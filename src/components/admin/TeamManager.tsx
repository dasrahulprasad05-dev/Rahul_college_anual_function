import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, Shield, ScanLine, UserCog, Settings2, Search } from "lucide-react";
import { toast } from "sonner";

type Profile = { id: string; email: string | null; full_name: string | null };
type RoleRow = { user_id: string; role: "admin" | "volunteer" | "student" };
type EventRow = { id: string; name: string; event_date: string };
type Assignment = { event_id: string; user_id: string };

export function TeamManager() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["team-data"],
    queryFn: async () => {
      const [profRes, roleRes, evRes, asgRes] = await Promise.all([
        supabase.from("profiles").select("id, email, full_name").order("email"),
        supabase.from("user_roles").select("user_id, role"),
        supabase.from("events").select("id, name, event_date").order("event_date"),
        supabase.from("event_volunteers").select("event_id, user_id"),
      ]);
      if (profRes.error) throw profRes.error;
      if (roleRes.error) throw roleRes.error;
      if (evRes.error) throw evRes.error;
      if (asgRes.error) throw asgRes.error;
      return {
        profiles: (profRes.data ?? []) as Profile[],
        roles: (roleRes.data ?? []) as RoleRow[],
        events: (evRes.data ?? []) as EventRow[],
        assignments: (asgRes.data ?? []) as Assignment[],
      };
    },
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["team-data"] });

  const setRole = useMutation({
    mutationFn: async ({ userId, role, enabled }: { userId: string; role: "admin" | "volunteer"; enabled: boolean }) => {
      if (enabled) {
        const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
        if (error && !String(error.message).includes("duplicate")) throw error;
      } else {
        const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);
        if (error) throw error;
      }
    },
    onSuccess: () => { invalidate(); toast.success("Role updated"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleAssignment = useMutation({
    mutationFn: async ({ userId, eventId, assigned }: { userId: string; eventId: string; assigned: boolean }) => {
      if (assigned) {
        const { error } = await supabase.from("event_volunteers").insert({ user_id: userId, event_id: eventId });
        if (error && !String(error.message).includes("duplicate")) throw error;
      } else {
        const { error } = await supabase.from("event_volunteers").delete()
          .eq("user_id", userId).eq("event_id", eventId);
        if (error) throw error;
      }
    },
    onSuccess: () => { invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = useMemo(() => {
    if (!data) return [];
    const rolesBy = new Map<string, Set<string>>();
    for (const r of data.roles) {
      const s = rolesBy.get(r.user_id) ?? new Set();
      s.add(r.role);
      rolesBy.set(r.user_id, s);
    }
    const asgCount = new Map<string, number>();
    for (const a of data.assignments) {
      asgCount.set(a.user_id, (asgCount.get(a.user_id) ?? 0) + 1);
    }
    const term = q.trim().toLowerCase();
    return data.profiles
      .filter((p) => !term || (p.email ?? "").toLowerCase().includes(term) || (p.full_name ?? "").toLowerCase().includes(term))
      .map((p) => ({
        ...p,
        isAdmin: rolesBy.get(p.id)?.has("admin") ?? false,
        isVolunteer: rolesBy.get(p.id)?.has("volunteer") ?? false,
        assignedCount: asgCount.get(p.id) ?? 0,
      }));
  }, [data, q]);

  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2"><Users className="w-5 h-5 text-primary" />Team</h2>
          <p className="text-sm text-muted-foreground">Grant roles and assign volunteers to events.</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name or email" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9 w-64" />
        </div>
      </div>

      {isLoading && <div className="text-sm text-muted-foreground">Loading users…</div>}

      <div className="overflow-x-auto -mx-2">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-3 py-2">User</th>
              <th className="px-3 py-2 text-center">Admin</th>
              <th className="px-3 py-2 text-center">Volunteer</th>
              <th className="px-3 py-2 text-center">Events</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className="border-t border-border/40">
                <td className="px-3 py-2.5">
                  <div className="font-medium">{u.full_name || "—"}</div>
                  <div className="text-xs text-muted-foreground">{u.email}</div>
                </td>
                <td className="px-3 py-2.5 text-center">
                  <Checkbox checked={u.isAdmin}
                    onCheckedChange={(v) => setRole.mutate({ userId: u.id, role: "admin", enabled: !!v })} />
                </td>
                <td className="px-3 py-2.5 text-center">
                  <Checkbox checked={u.isVolunteer}
                    onCheckedChange={(v) => setRole.mutate({ userId: u.id, role: "volunteer", enabled: !!v })} />
                </td>
                <td className="px-3 py-2.5 text-center">
                  {u.isVolunteer ? (
                    <Badge variant="secondary" className="tabular-nums">{u.assignedCount}</Badge>
                  ) : <span className="text-xs text-muted-foreground">—</span>}
                </td>
                <td className="px-3 py-2.5 text-right">
                  {u.isVolunteer && data && (
                    <AssignEventsDialog
                      user={u}
                      events={data.events}
                      assignedEventIds={new Set(data.assignments.filter((a) => a.user_id === u.id).map((a) => a.event_id))}
                      onToggle={(eventId, assigned) => toggleAssignment.mutate({ userId: u.id, eventId, assigned })}
                    />
                  )}
                </td>
              </tr>
            ))}
            {!isLoading && rows.length === 0 && (
              <tr><td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">No users match.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Shield className="w-3 h-3" />Admin = full access</span>
        <span className="flex items-center gap-1"><ScanLine className="w-3 h-3" />Volunteer = can scan assigned events</span>
      </div>
    </div>
  );
}

function AssignEventsDialog({
  user, events, assignedEventIds, onToggle,
}: {
  user: { id: string; email: string | null; full_name: string | null };
  events: EventRow[];
  assignedEventIds: Set<string>;
  onToggle: (eventId: string, assigned: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm"><Settings2 className="w-3 h-3 mr-1" />Events</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><UserCog className="w-4 h-4" />Assign events</DialogTitle>
          <p className="text-xs text-muted-foreground">{user.full_name || user.email}</p>
        </DialogHeader>
        <div className="max-h-96 overflow-y-auto space-y-1">
          {events.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No events yet.</p>}
          {events.map((e) => {
            const assigned = assignedEventIds.has(e.id);
            return (
              <label key={e.id} className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-background/60 cursor-pointer">
                <Checkbox checked={assigned} onCheckedChange={(v) => onToggle(e.id, !!v)} />
                <div className="flex-1">
                  <div className="text-sm font-medium">{e.name}</div>
                  <div className="text-xs text-muted-foreground">{new Date(e.event_date).toLocaleDateString()}</div>
                </div>
              </label>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
