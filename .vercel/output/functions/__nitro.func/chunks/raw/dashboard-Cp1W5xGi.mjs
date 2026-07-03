import { u as useAuth, d as db } from './router-j_9pWM7h.mjs';
import { B as Button } from './button-DRsC1qZi.mjs';
import { N as Navbar } from './Navbar-DzHODt_V.mjs';
import { e as eventColors } from './event-color-BBcoXhrs.mjs';
import { useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { useQuery } from '@tanstack/react-query';
import { getDocs, collection, collectionGroup } from 'firebase/firestore';
import { AlertTriangle, TrendingUp, IndianRupee, Ticket, ScanLine, Users, Calendar } from 'lucide-react';
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Area, BarChart, Bar, Cell } from 'recharts';
import { startOfDay, subDays, format } from 'date-fns';
import 'firebase/auth';
import 'firebase/app';
import 'firebase/storage';
import 'sonner';
import 'zod';
import '@radix-ui/react-slot';
import 'class-variance-authority';
import 'clsx';
import 'tailwind-merge';
import 'framer-motion';

var INR = (cents) => `\u20B9${(cents / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
function DashboardPage() {
  var _a, _b, _c, _d;
  const { isAdmin, loading, user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-data"],
    enabled: isAdmin,
    queryFn: async () => {
      const [evRes, itRes, tkRes, usrRes] = await Promise.all([
        getDocs(collection(db, "events")),
        getDocs(collectionGroup(db, "items")),
        getDocs(collection(db, "tickets")),
        getDocs(collection(db, "users"))
      ]);
      return {
        events: evRes.docs.map((d) => ({
          id: d.id,
          ...d.data()
        })),
        items: itRes.docs.map((d) => ({
          id: d.id,
          ...d.data()
        })),
        tickets: tkRes.docs.map((d) => ({
          id: d.id,
          ...d.data()
        })),
        usersCount: usrRes.size
      };
    }
  });
  const stats = useMemo(() => {
    if (!data)
      return null;
    const { events, items, tickets, usersCount } = data;
    const itemToEvent = new Map(items.map((i) => [i.id, i.event_id]));
    const active = tickets.filter((t) => t.status !== "cancelled");
    const totalRevenueCents = active.filter((t) => t.status === "paid" || t.status === "used").reduce((s, t) => s + t.price_cents, 0);
    const totalScans = tickets.filter((t) => t.status === "used").length;
    const capacity = items.reduce((s, i) => {
      var _a2;
      return s + ((_a2 = i.capacity) != null ? _a2 : 0);
    }, 0);
    const booked = items.reduce((s, i) => {
      var _a2;
      return s + ((_a2 = i.booked_count) != null ? _a2 : 0);
    }, 0);
    const fillRate = capacity > 0 ? Math.round(booked / capacity * 100) : 0;
    const perEvent = events.map((e) => {
      const evItems = items.filter((i) => i.event_id === e.id);
      const evCapacity = evItems.reduce((s, i) => {
        var _a2;
        return s + ((_a2 = i.capacity) != null ? _a2 : 0);
      }, 0);
      const evBooked = evItems.reduce((s, i) => {
        var _a2;
        return s + ((_a2 = i.booked_count) != null ? _a2 : 0);
      }, 0);
      const evTickets = active.filter((t) => itemToEvent.get(t.item_id) === e.id);
      const evRevenue = evTickets.filter((t) => t.status === "paid" || t.status === "used").reduce((s, t) => s + t.price_cents, 0);
      const evScans = evTickets.filter((t) => t.status === "used").length;
      const c = eventColors(e.id);
      return {
        id: e.id,
        name: e.name,
        short: e.name.length > 18 ? e.name.slice(0, 16) + "\u2026" : e.name,
        date: e.event_date,
        registrations: evTickets.length,
        scans: evScans,
        revenue: evRevenue,
        capacity: evCapacity,
        booked: evBooked,
        fill: evCapacity > 0 ? Math.round(evBooked / evCapacity * 100) : 0,
        color: `hsl(${c.hue} 85% 60%)`
      };
    });
    const today = startOfDay(/* @__PURE__ */ new Date());
    const series = Array.from({ length: 14 }, (_, i) => startOfDay(subDays(today, 13 - i))).map((d) => {
      const next = new Date(d.getTime() + 864e5);
      const dayTickets = active.filter((t) => {
        const ts = new Date(t.created_at);
        return ts >= d && ts < next;
      });
      return {
        date: format(d, "MMM d"),
        registrations: dayTickets.length,
        revenue: dayTickets.filter((t) => t.status === "paid" || t.status === "used").reduce((s, t) => s + t.price_cents, 0) / 100
      };
    });
    return {
      totals: {
        revenue: totalRevenueCents,
        registrations: active.length,
        scans: totalScans,
        users: usersCount,
        fillRate
      },
      perEvent: perEvent.sort((a, b) => b.registrations - a.registrations),
      series
    };
  }, [data]);
  if (loading)
    return /* @__PURE__ */ jsx("div", {
      className: "min-h-screen",
      children: /* @__PURE__ */ jsx(Navbar, {})
    });
  if (!isAdmin)
    return /* @__PURE__ */ jsxs("div", {
      className: "min-h-screen",
      children: [/* @__PURE__ */ jsx(Navbar, {}), /* @__PURE__ */ jsxs("div", {
        className: "max-w-md mx-auto px-4 py-16 text-center",
        children: [
          /* @__PURE__ */ jsx(AlertTriangle, { className: "w-12 h-12 mx-auto text-accent" }),
          /* @__PURE__ */ jsx("h1", {
            className: "text-2xl font-bold mt-4",
            children: "Admin access required"
          }),
          /* @__PURE__ */ jsxs("p", {
            className: "text-muted-foreground mt-2",
            children: [
              "You're signed in as ",
              /* @__PURE__ */ jsx("span", {
                className: "font-mono text-xs",
                children: user == null ? void 0 : user.email
              }),
              " but don't have the admin role."
            ]
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
      className: "max-w-6xl mx-auto px-4 py-8",
      children: [
        /* @__PURE__ */ jsxs("div", {
          className: "flex items-center justify-between mb-6 gap-4 flex-wrap",
          children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("h1", {
            className: "text-3xl font-bold flex items-center gap-2",
            children: [/* @__PURE__ */ jsx(TrendingUp, { className: "w-7 h-7 text-primary" }), "Dashboard"]
          }), /* @__PURE__ */ jsx("p", {
            className: "text-muted-foreground",
            children: "Live analytics across all events."
          })] }), /* @__PURE__ */ jsx(Button, {
            asChild: true,
            variant: "outline",
            children: /* @__PURE__ */ jsx(Link, {
              to: "/admin",
              children: "Manage events \u2192"
            })
          })]
        }),
        /* @__PURE__ */ jsxs("div", {
          className: "grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8",
          children: [
            /* @__PURE__ */ jsx(Kpi, {
              icon: IndianRupee,
              label: "Revenue",
              value: stats ? INR(stats.totals.revenue) : "\u2014"
            }),
            /* @__PURE__ */ jsx(Kpi, {
              icon: Ticket,
              label: "Registrations",
              value: (_a = stats == null ? void 0 : stats.totals.registrations) != null ? _a : 0
            }),
            /* @__PURE__ */ jsx(Kpi, {
              icon: ScanLine,
              label: "Check-ins",
              value: (_b = stats == null ? void 0 : stats.totals.scans) != null ? _b : 0
            }),
            /* @__PURE__ */ jsx(Kpi, {
              icon: Users,
              label: "Users",
              value: (_c = stats == null ? void 0 : stats.totals.users) != null ? _c : 0
            }),
            /* @__PURE__ */ jsx(Kpi, {
              icon: Calendar,
              label: "Fill rate",
              value: `${(_d = stats == null ? void 0 : stats.totals.fillRate) != null ? _d : 0}%`
            })
          ]
        }),
        isLoading && /* @__PURE__ */ jsx("div", {
          className: "text-sm text-muted-foreground",
          children: "Loading analytics\u2026"
        }),
        stats && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Panel, {
            title: "Last 14 days",
            subtitle: "Daily registrations and revenue",
            children: /* @__PURE__ */ jsx("div", {
              className: "h-72",
              children: /* @__PURE__ */ jsx(ResponsiveContainer, {
                width: "100%",
                height: "100%",
                children: /* @__PURE__ */ jsxs(AreaChart, {
                  data: stats.series,
                  margin: {
                    top: 10,
                    right: 16,
                    left: -8,
                    bottom: 0
                  },
                  children: [
                    /* @__PURE__ */ jsxs("defs", { children: [/* @__PURE__ */ jsxs("linearGradient", {
                      id: "gReg",
                      x1: "0",
                      y1: "0",
                      x2: "0",
                      y2: "1",
                      children: [/* @__PURE__ */ jsx("stop", {
                        offset: "0%",
                        stopColor: "hsl(var(--primary))",
                        stopOpacity: 0.5
                      }), /* @__PURE__ */ jsx("stop", {
                        offset: "100%",
                        stopColor: "hsl(var(--primary))",
                        stopOpacity: 0
                      })]
                    }), /* @__PURE__ */ jsxs("linearGradient", {
                      id: "gRev",
                      x1: "0",
                      y1: "0",
                      x2: "0",
                      y2: "1",
                      children: [/* @__PURE__ */ jsx("stop", {
                        offset: "0%",
                        stopColor: "hsl(var(--accent))",
                        stopOpacity: 0.45
                      }), /* @__PURE__ */ jsx("stop", {
                        offset: "100%",
                        stopColor: "hsl(var(--accent))",
                        stopOpacity: 0
                      })]
                    })] }),
                    /* @__PURE__ */ jsx(CartesianGrid, {
                      strokeDasharray: "3 3",
                      stroke: "hsl(var(--border))",
                      opacity: 0.4
                    }),
                    /* @__PURE__ */ jsx(XAxis, {
                      dataKey: "date",
                      stroke: "hsl(var(--muted-foreground))",
                      fontSize: 11
                    }),
                    /* @__PURE__ */ jsx(YAxis, {
                      stroke: "hsl(var(--muted-foreground))",
                      fontSize: 11
                    }),
                    /* @__PURE__ */ jsx(Tooltip, { content: /* @__PURE__ */ jsx(DarkTooltip, {}) }),
                    /* @__PURE__ */ jsx(Legend, { wrapperStyle: { fontSize: 12 } }),
                    /* @__PURE__ */ jsx(Area, {
                      type: "monotone",
                      dataKey: "registrations",
                      name: "Registrations",
                      stroke: "hsl(var(--primary))",
                      fill: "url(#gReg)",
                      strokeWidth: 2
                    }),
                    /* @__PURE__ */ jsx(Area, {
                      type: "monotone",
                      dataKey: "revenue",
                      name: "Revenue (\u20B9)",
                      stroke: "hsl(var(--accent))",
                      fill: "url(#gRev)",
                      strokeWidth: 2
                    })
                  ]
                })
              })
            })
          }),
          /* @__PURE__ */ jsxs("div", {
            className: "grid lg:grid-cols-2 gap-6 mt-6",
            children: [/* @__PURE__ */ jsx(Panel, {
              title: "Registrations per event",
              subtitle: "Total active tickets per event",
              children: /* @__PURE__ */ jsx(ChartHorizontal, {
                data: stats.perEvent,
                dataKey: "registrations"
              })
            }), /* @__PURE__ */ jsx(Panel, {
              title: "Revenue per event",
              subtitle: "Paid + used tickets, in \u20B9",
              children: /* @__PURE__ */ jsx(ChartHorizontal, {
                data: stats.perEvent,
                dataKey: "revenue",
                valueFormatter: (v) => INR(v)
              })
            })]
          }),
          /* @__PURE__ */ jsx(Panel, {
            className: "mt-6",
            title: "Check-ins per event",
            subtitle: "Scanned tickets at the gate",
            children: /* @__PURE__ */ jsx(ChartHorizontal, {
              data: stats.perEvent,
              dataKey: "scans"
            })
          }),
          /* @__PURE__ */ jsx(Panel, {
            className: "mt-6",
            title: "Event breakdown",
            subtitle: "Tap an event to manage it",
            children: /* @__PURE__ */ jsx("div", {
              className: "overflow-x-auto -mx-2",
              children: /* @__PURE__ */ jsxs("table", {
                className: "w-full text-sm",
                children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
                  className: "text-left text-xs uppercase tracking-wide text-muted-foreground",
                  children: [
                    /* @__PURE__ */ jsx("th", {
                      className: "px-3 py-2",
                      children: "Event"
                    }),
                    /* @__PURE__ */ jsx("th", {
                      className: "px-3 py-2 text-right",
                      children: "Registered"
                    }),
                    /* @__PURE__ */ jsx("th", {
                      className: "px-3 py-2 text-right",
                      children: "Scanned"
                    }),
                    /* @__PURE__ */ jsx("th", {
                      className: "px-3 py-2 text-right",
                      children: "Revenue"
                    }),
                    /* @__PURE__ */ jsx("th", {
                      className: "px-3 py-2 text-right",
                      children: "Fill"
                    })
                  ]
                }) }), /* @__PURE__ */ jsxs("tbody", { children: [stats.perEvent.map((e) => /* @__PURE__ */ jsxs("tr", {
                  className: "border-t border-border/40 hover:bg-card/60 transition",
                  children: [
                    /* @__PURE__ */ jsx("td", {
                      className: "px-3 py-2.5",
                      children: /* @__PURE__ */ jsxs("div", {
                        className: "flex items-center gap-2",
                        children: [/* @__PURE__ */ jsx("span", {
                          className: "w-2 h-6 rounded-full",
                          style: { background: e.color }
                        }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(Link, {
                          to: "/events/$eventId",
                          params: { eventId: e.id },
                          className: "font-medium hover:underline",
                          children: e.name
                        }), /* @__PURE__ */ jsx("div", {
                          className: "text-xs text-muted-foreground",
                          children: new Date(e.date).toLocaleDateString()
                        })] })]
                      })
                    }),
                    /* @__PURE__ */ jsx("td", {
                      className: "px-3 py-2.5 text-right tabular-nums",
                      children: e.registrations
                    }),
                    /* @__PURE__ */ jsx("td", {
                      className: "px-3 py-2.5 text-right tabular-nums",
                      children: e.scans
                    }),
                    /* @__PURE__ */ jsx("td", {
                      className: "px-3 py-2.5 text-right tabular-nums",
                      children: INR(e.revenue)
                    }),
                    /* @__PURE__ */ jsx("td", {
                      className: "px-3 py-2.5 text-right tabular-nums",
                      children: e.capacity > 0 ? /* @__PURE__ */ jsxs("span", {
                        className: e.fill >= 90 ? "text-destructive" : e.fill >= 60 ? "text-accent" : "text-muted-foreground",
                        children: [e.fill, "%"]
                      }) : /* @__PURE__ */ jsx("span", {
                        className: "text-muted-foreground",
                        children: "\u2014"
                      })
                    })
                  ]
                }, e.id)), stats.perEvent.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", {
                  colSpan: 5,
                  className: "px-3 py-8 text-center text-muted-foreground",
                  children: "No events yet."
                }) })] })]
              })
            })
          })
        ] })
      ]
    })]
  });
}
function Kpi({ icon: Icon, label, value }) {
  return /* @__PURE__ */ jsxs("div", {
    className: "rounded-2xl border border-border/60 bg-card/60 p-5",
    children: [
      /* @__PURE__ */ jsx(Icon, { className: "w-5 h-5 text-primary mb-2" }),
      /* @__PURE__ */ jsx("div", {
        className: "text-2xl md:text-3xl font-bold tracking-tight",
        children: value
      }),
      /* @__PURE__ */ jsx("div", {
        className: "text-xs text-muted-foreground mt-0.5",
        children: label
      })
    ]
  });
}
function Panel({ title, subtitle, children, className = "" }) {
  return /* @__PURE__ */ jsxs("section", {
    className: `rounded-2xl border border-border/60 bg-card/60 p-5 ${className}`,
    children: [/* @__PURE__ */ jsxs("header", {
      className: "mb-4",
      children: [/* @__PURE__ */ jsx("h2", {
        className: "text-base font-semibold",
        children: title
      }), subtitle && /* @__PURE__ */ jsx("p", {
        className: "text-xs text-muted-foreground",
        children: subtitle
      })]
    }), children]
  });
}
function ChartHorizontal({ data, dataKey, valueFormatter }) {
  const rows = data.slice(0, 10);
  return /* @__PURE__ */ jsx("div", {
    style: { height: Math.max(220, rows.length * 34 + 40) },
    children: /* @__PURE__ */ jsx(ResponsiveContainer, {
      width: "100%",
      height: "100%",
      children: /* @__PURE__ */ jsxs(BarChart, {
        data: rows,
        layout: "vertical",
        margin: {
          top: 4,
          right: 24,
          left: 8,
          bottom: 0
        },
        children: [
          /* @__PURE__ */ jsx(CartesianGrid, {
            strokeDasharray: "3 3",
            horizontal: false,
            stroke: "hsl(var(--border))",
            opacity: 0.4
          }),
          /* @__PURE__ */ jsx(XAxis, {
            type: "number",
            stroke: "hsl(var(--muted-foreground))",
            fontSize: 11,
            tickFormatter: valueFormatter
          }),
          /* @__PURE__ */ jsx(YAxis, {
            type: "category",
            dataKey: "short",
            width: 120,
            stroke: "hsl(var(--muted-foreground))",
            fontSize: 11
          }),
          /* @__PURE__ */ jsx(Tooltip, {
            content: /* @__PURE__ */ jsx(DarkTooltip, { valueFormatter }),
            cursor: {
              fill: "hsl(var(--muted))",
              opacity: 0.2
            }
          }),
          /* @__PURE__ */ jsx(Bar, {
            dataKey,
            radius: [
              0,
              6,
              6,
              0
            ],
            children: rows.map((r) => /* @__PURE__ */ jsx(Cell, { fill: r.color }, r.id))
          })
        ]
      })
    })
  });
}
function DarkTooltip({ active, payload, label, valueFormatter }) {
  if (!active || !(payload == null ? void 0 : payload.length))
    return null;
  return /* @__PURE__ */ jsxs("div", {
    className: "rounded-lg border border-border/60 bg-background/95 backdrop-blur px-3 py-2 text-xs shadow-lg",
    children: [/* @__PURE__ */ jsx("div", {
      className: "font-medium mb-1",
      children: label
    }), payload.map((p, i) => /* @__PURE__ */ jsxs("div", {
      className: "flex items-center gap-2",
      children: [
        /* @__PURE__ */ jsx("span", {
          className: "w-2 h-2 rounded-full",
          style: { background: p.color }
        }),
        /* @__PURE__ */ jsxs("span", {
          className: "text-muted-foreground",
          children: [p.name, ":"]
        }),
        /* @__PURE__ */ jsx("span", {
          className: "font-medium tabular-nums",
          children: valueFormatter ? valueFormatter(p.value) : p.value
        })
      ]
    }, i))]
  });
}

export { DashboardPage as component };
//# sourceMappingURL=dashboard-Cp1W5xGi.mjs.map
