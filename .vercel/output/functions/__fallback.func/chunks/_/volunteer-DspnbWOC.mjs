import { u as useAuth, d as db } from './router-j_9pWM7h.mjs';
import { B as Button } from './button-DRsC1qZi.mjs';
import { N as Navbar } from './Navbar-DzHODt_V.mjs';
import { e as eventColors } from './event-color-BBcoXhrs.mjs';
import { Link } from '@tanstack/react-router';
import { jsx, jsxs } from 'react/jsx-runtime';
import { useQuery } from '@tanstack/react-query';
import { getDocs, query, collection, where, getDoc, doc } from 'firebase/firestore';
import { AlertTriangle, ScanLine, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import 'firebase/auth';
import 'firebase/app';
import 'firebase/storage';
import 'react';
import 'sonner';
import 'zod';
import '@radix-ui/react-slot';
import 'class-variance-authority';
import 'clsx';
import 'tailwind-merge';
import 'framer-motion';

function VolunteerPage() {
  const { user, isVolunteer, loading } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["volunteer-dashboard", user == null ? void 0 : user.id],
    enabled: !!user && isVolunteer,
    queryFn: async () => {
      const assignmentsRaw = (await getDocs(query(collection(db, "event_volunteers"), where("user_id", "==", user.id)))).docs.map((d) => d.data());
      const eventIds = assignmentsRaw.map((a) => a.event_id);
      const assignments = await Promise.all(assignmentsRaw.map(async (a) => {
        const evSnap = await getDoc(doc(db, "events", a.event_id));
        return {
          event_id: a.event_id,
          events: evSnap.exists() ? {
            id: evSnap.id,
            ...evSnap.data()
          } : null
        };
      }));
      let scans = (await getDocs(query(collection(db, "tickets"), where("used_by", "==", user.id)))).docs.map((d) => ({
        id: d.id,
        ...d.data()
      }));
      scans = scans.sort((a, b) => new Date(b.used_at).getTime() - new Date(a.used_at).getTime()).slice(0, 20);
      scans = await Promise.all(scans.map(async (s) => {
        const itemSnap = await getDoc(doc(db, `events/${s.event_id}/items/${s.item_id}`));
        const evSnap = await getDoc(doc(db, "events", s.event_id));
        return {
          ...s,
          items: {
            name: itemSnap.exists() ? itemSnap.data().name : "\u2014",
            events: { name: evSnap.exists() ? evSnap.data().name : "" }
          }
        };
      }));
      const statsByEvent = /* @__PURE__ */ new Map();
      if (eventIds.length) for (const eid of eventIds) {
        const tSnap = await getDocs(query(collection(db, "tickets"), where("event_id", "==", eid)));
        let total = 0;
        let scanned = 0;
        tSnap.forEach((d) => {
          const status = d.data().status;
          if (status !== "cancelled") {
            total++;
            if (status === "used") scanned++;
          }
        });
        statsByEvent.set(eid, {
          total,
          scanned
        });
      }
      return {
        assignments,
        scans,
        statsByEvent
      };
    }
  });
  if (loading) return /* @__PURE__ */ jsx("div", {
    className: "min-h-screen",
    children: /* @__PURE__ */ jsx(Navbar, {})
  });
  if (!isVolunteer) return /* @__PURE__ */ jsxs("div", {
    className: "min-h-screen",
    children: [/* @__PURE__ */ jsx(Navbar, {}), /* @__PURE__ */ jsxs("div", {
      className: "max-w-md mx-auto px-4 py-16 text-center",
      children: [
        /* @__PURE__ */ jsx(AlertTriangle, { className: "w-12 h-12 mx-auto text-accent" }),
        /* @__PURE__ */ jsx("h1", {
          className: "text-2xl font-bold mt-4",
          children: "Volunteers only"
        }),
        /* @__PURE__ */ jsx("p", {
          className: "text-muted-foreground mt-2",
          children: "Ask an admin to grant volunteer access."
        }),
        /* @__PURE__ */ jsx(Button, {
          asChild: true,
          className: "mt-6",
          children: /* @__PURE__ */ jsx(Link, {
            to: "/",
            children: "Go home"
          })
        })
      ]
    })]
  });
  return /* @__PURE__ */ jsxs("div", {
    className: "min-h-screen",
    children: [/* @__PURE__ */ jsx(Navbar, {}), /* @__PURE__ */ jsxs("div", {
      className: "max-w-4xl mx-auto px-4 py-8",
      children: [
        /* @__PURE__ */ jsxs("div", {
          className: "flex items-center justify-between mb-6 flex-wrap gap-3",
          children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
            className: "text-3xl font-bold",
            children: "Volunteer"
          }), /* @__PURE__ */ jsx("p", {
            className: "text-muted-foreground",
            children: "Your assigned events and recent scans."
          })] }), /* @__PURE__ */ jsx(Button, {
            asChild: true,
            className: "gradient-gold text-primary-foreground hover:opacity-90",
            children: /* @__PURE__ */ jsxs(Link, {
              to: "/scan",
              children: [/* @__PURE__ */ jsx(ScanLine, { className: "w-4 h-4 mr-1.5" }), "Open scanner"]
            })
          })]
        }),
        /* @__PURE__ */ jsxs("section", {
          className: "mb-8",
          children: [
            /* @__PURE__ */ jsxs("h2", {
              className: "text-lg font-semibold mb-3 flex items-center gap-2",
              children: [/* @__PURE__ */ jsx(Calendar, { className: "w-5 h-5 text-primary" }), "Assigned events"]
            }),
            isLoading && /* @__PURE__ */ jsx("div", {
              className: "text-sm text-muted-foreground",
              children: "Loading\u2026"
            }),
            data && data.assignments.length === 0 && /* @__PURE__ */ jsx("div", {
              className: "rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground text-sm",
              children: "No events assigned yet. An admin will assign you soon."
            }),
            /* @__PURE__ */ jsx("div", {
              className: "grid sm:grid-cols-2 gap-3",
              children: data == null ? void 0 : data.assignments.map((a) => {
                var _a, _b;
                const e = a.events;
                if (!e) return null;
                const c = eventColors(e.id);
                const stats = (_a = data.statsByEvent.get(e.id)) != null ? _a : {
                  total: 0,
                  scanned: 0
                };
                const remaining = Math.max(stats.total - stats.scanned, 0);
                const pct = stats.total > 0 ? Math.round(stats.scanned / stats.total * 100) : 0;
                return /* @__PURE__ */ jsxs("div", {
                  className: "rounded-2xl border border-border/60 bg-card/60 p-5 relative overflow-hidden",
                  children: [
                    /* @__PURE__ */ jsx("div", {
                      className: "absolute inset-x-0 top-0 h-1",
                      style: { background: `hsl(${c.hue} 85% 60%)` }
                    }),
                    /* @__PURE__ */ jsx("h3", {
                      className: "font-bold",
                      children: e.name
                    }),
                    /* @__PURE__ */ jsxs("p", {
                      className: "text-xs text-muted-foreground",
                      children: [
                        new Date(e.event_date).toLocaleDateString(),
                        " \xB7 ",
                        (_b = e.venue) != null ? _b : "\u2014"
                      ]
                    }),
                    /* @__PURE__ */ jsxs("div", {
                      className: "mt-3 flex items-center gap-4 text-sm",
                      children: [/* @__PURE__ */ jsxs("div", { children: [
                        /* @__PURE__ */ jsx("span", {
                          className: "font-bold text-lg",
                          children: stats.scanned
                        }),
                        " ",
                        /* @__PURE__ */ jsx("span", {
                          className: "text-muted-foreground text-xs",
                          children: "scanned"
                        })
                      ] }), /* @__PURE__ */ jsxs("div", { children: [
                        /* @__PURE__ */ jsx("span", {
                          className: "font-bold text-lg",
                          children: remaining
                        }),
                        " ",
                        /* @__PURE__ */ jsx("span", {
                          className: "text-muted-foreground text-xs",
                          children: "remaining"
                        })
                      ] })]
                    }),
                    /* @__PURE__ */ jsx("div", {
                      className: "mt-2 h-1.5 rounded-full bg-muted overflow-hidden",
                      children: /* @__PURE__ */ jsx("div", {
                        className: "h-full rounded-full",
                        style: {
                          width: `${pct}%`,
                          background: `hsl(${c.hue} 85% 60%)`
                        }
                      })
                    })
                  ]
                }, e.id);
              })
            })
          ]
        }),
        /* @__PURE__ */ jsxs("section", { children: [
          /* @__PURE__ */ jsxs("h2", {
            className: "text-lg font-semibold mb-3 flex items-center gap-2",
            children: [/* @__PURE__ */ jsx(CheckCircle2, { className: "w-5 h-5 text-success" }), "Recent scans"]
          }),
          data && data.scans.length === 0 && /* @__PURE__ */ jsx("div", {
            className: "rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground text-sm",
            children: "No scans yet."
          }),
          /* @__PURE__ */ jsx("div", {
            className: "rounded-2xl border border-border/60 bg-card/60 divide-y divide-border/40",
            children: data == null ? void 0 : data.scans.map((s) => {
              var _a, _b, _c;
              const item = s.items;
              return /* @__PURE__ */ jsxs("div", {
                className: "px-4 py-3 flex items-center justify-between",
                children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
                  className: "font-medium text-sm",
                  children: (_a = item == null ? void 0 : item.name) != null ? _a : "\u2014"
                }), /* @__PURE__ */ jsx("div", {
                  className: "text-xs text-muted-foreground",
                  children: (_c = (_b = item == null ? void 0 : item.events) == null ? void 0 : _b.name) != null ? _c : ""
                })] }), /* @__PURE__ */ jsxs("div", {
                  className: "text-xs text-muted-foreground flex items-center gap-1 tabular-nums",
                  children: [/* @__PURE__ */ jsx(Clock, { className: "w-3 h-3" }), s.used_at ? formatDistanceToNow(new Date(s.used_at), { addSuffix: true }) : ""]
                })]
              }, s.id);
            })
          })
        ] })
      ]
    })]
  });
}

export { VolunteerPage as component };
//# sourceMappingURL=volunteer-DspnbWOC.mjs.map
