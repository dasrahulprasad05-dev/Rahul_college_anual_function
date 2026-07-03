import { d as db } from './router-j_9pWM7h.mjs';
import { e as eventsService } from './events-CWfQmYOn.mjs';
import { c as cn, B as Button } from './button-DRsC1qZi.mjs';
import { L as Label, I as Input } from './label-CmIE8x5o.mjs';
import { D as Dialog, a as DialogTrigger, b as DialogContent, c as DialogHeader, d as DialogTitle, T as Textarea, e as DialogFooter } from './textarea-Ds6mtKuq.mjs';
import { g as gatePassService, G as GatePassPDF } from './GatePassPDF-Ca6dVrUP.mjs';
import { N as Navbar } from './Navbar-DzHODt_V.mjs';
import * as React from 'react';
import { useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { getCountFromServer, collection, query, where, getDocs, collectionGroup, setDoc, doc, deleteDoc, writeBatch } from 'firebase/firestore';
import { toast } from 'sonner';
import { cva } from 'class-variance-authority';
import { Check, AlertTriangle, Plus, Calendar, Ticket, ScanLine, Users, EyeOff, Eye, Pencil, Trash2, Search, Shield, Settings2, UserCog, ExternalLink, X, FileText } from 'lucide-react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { PDFDownloadLink } from '@react-pdf/renderer';
import * as SwitchPrimitives from '@radix-ui/react-switch';
import 'firebase/auth';
import 'firebase/app';
import 'firebase/storage';
import 'zod';
import '@radix-ui/react-slot';
import 'clsx';
import 'tailwind-merge';
import '@radix-ui/react-label';
import '@radix-ui/react-dialog';
import 'framer-motion';

var badgeVariants = cva("inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", {
  variants: { variant: {
    default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
    secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
    outline: "text-foreground"
  } },
  defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
  return /* @__PURE__ */ jsx("div", {
    className: cn(badgeVariants({ variant }), className),
    ...props
  });
}
var Checkbox = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(CheckboxPrimitive.Root, {
  ref,
  className: cn("grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground", className),
  ...props,
  children: /* @__PURE__ */ jsx(CheckboxPrimitive.Indicator, {
    className: cn("grid place-content-center text-current"),
    children: /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" })
  })
}));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;
function TeamManager() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["team-data"],
    queryFn: async () => {
      const [profRes, roleRes, evRes, asgRes] = await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(collection(db, "user_roles")),
        getDocs(collection(db, "events")),
        getDocs(collection(db, "event_volunteers"))
      ]);
      return {
        profiles: profRes.docs.map((d) => ({
          id: d.id,
          ...d.data()
        })),
        roles: roleRes.docs.map((d) => ({ ...d.data() })),
        events: evRes.docs.map((d) => ({
          id: d.id,
          ...d.data()
        })).sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()),
        assignments: asgRes.docs.map((d) => ({ ...d.data() }))
      };
    }
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["team-data"] });
  const setRole = useMutation({
    mutationFn: async ({ userId, role, enabled }) => {
      const roleId = `${userId}_${role}`;
      if (enabled)
        await setDoc(doc(db, "user_roles", roleId), {
          user_id: userId,
          role
        });
      else
        await deleteDoc(doc(db, "user_roles", roleId));
    },
    onSuccess: () => {
      invalidate();
      toast.success("Role updated");
    },
    onError: (e) => toast.error(e.message)
  });
  const toggleAssignment = useMutation({
    mutationFn: async ({ userId, eventId, assigned }) => {
      const asgId = `${userId}_${eventId}`;
      if (assigned)
        await setDoc(doc(db, "event_volunteers", asgId), {
          user_id: userId,
          event_id: eventId
        });
      else
        await deleteDoc(doc(db, "event_volunteers", asgId));
    },
    onSuccess: () => {
      invalidate();
    },
    onError: (e) => toast.error(e.message)
  });
  const rows = useMemo(() => {
    var _a, _b;
    if (!data)
      return [];
    const rolesBy = /* @__PURE__ */ new Map();
    for (const r of data.roles) {
      const s = (_a = rolesBy.get(r.user_id)) != null ? _a : /* @__PURE__ */ new Set();
      s.add(r.role);
      rolesBy.set(r.user_id, s);
    }
    const asgCount = /* @__PURE__ */ new Map();
    for (const a of data.assignments)
      asgCount.set(a.user_id, ((_b = asgCount.get(a.user_id)) != null ? _b : 0) + 1);
    const term = q.trim().toLowerCase();
    return data.profiles.filter((p) => {
      var _a2, _b2;
      return !term || ((_a2 = p.email) != null ? _a2 : "").toLowerCase().includes(term) || ((_b2 = p.full_name) != null ? _b2 : "").toLowerCase().includes(term);
    }).map((p) => {
      var _a2, _b2, _c, _d, _e;
      return {
        ...p,
        isAdmin: (_b2 = (_a2 = rolesBy.get(p.id)) == null ? void 0 : _a2.has("admin")) != null ? _b2 : false,
        isVolunteer: (_d = (_c = rolesBy.get(p.id)) == null ? void 0 : _c.has("volunteer")) != null ? _d : false,
        assignedCount: (_e = asgCount.get(p.id)) != null ? _e : 0
      };
    });
  }, [data, q]);
  return /* @__PURE__ */ jsxs("div", {
    className: "rounded-2xl border border-border/60 bg-card/60 p-6",
    children: [
      /* @__PURE__ */ jsxs("div", {
        className: "flex items-center justify-between mb-4 flex-wrap gap-3",
        children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("h2", {
          className: "text-xl font-bold flex items-center gap-2",
          children: [/* @__PURE__ */ jsx(Users, { className: "w-5 h-5 text-primary" }), "Team"]
        }), /* @__PURE__ */ jsx("p", {
          className: "text-sm text-muted-foreground",
          children: "Grant roles and assign volunteers to events."
        })] }), /* @__PURE__ */ jsxs("div", {
          className: "relative",
          children: [/* @__PURE__ */ jsx(Search, { className: "w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ jsx(Input, {
            placeholder: "Search by name or email",
            value: q,
            onChange: (e) => setQ(e.target.value),
            className: "pl-9 w-64"
          })]
        })]
      }),
      isLoading && /* @__PURE__ */ jsx("div", {
        className: "text-sm text-muted-foreground",
        children: "Loading users\u2026"
      }),
      /* @__PURE__ */ jsx("div", {
        className: "overflow-x-auto -mx-2",
        children: /* @__PURE__ */ jsxs("table", {
          className: "w-full text-sm",
          children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
            className: "text-left text-xs uppercase tracking-wide text-muted-foreground",
            children: [
              /* @__PURE__ */ jsx("th", {
                className: "px-3 py-2",
                children: "User"
              }),
              /* @__PURE__ */ jsx("th", {
                className: "px-3 py-2 text-center",
                children: "Admin"
              }),
              /* @__PURE__ */ jsx("th", {
                className: "px-3 py-2 text-center",
                children: "Volunteer"
              }),
              /* @__PURE__ */ jsx("th", {
                className: "px-3 py-2 text-center",
                children: "Events"
              }),
              /* @__PURE__ */ jsx("th", { className: "px-3 py-2" })
            ]
          }) }), /* @__PURE__ */ jsxs("tbody", { children: [rows.map((u) => /* @__PURE__ */ jsxs("tr", {
            className: "border-t border-border/40",
            children: [
              /* @__PURE__ */ jsxs("td", {
                className: "px-3 py-2.5",
                children: [/* @__PURE__ */ jsx("div", {
                  className: "font-medium",
                  children: u.full_name || "\u2014"
                }), /* @__PURE__ */ jsx("div", {
                  className: "text-xs text-muted-foreground",
                  children: u.email
                })]
              }),
              /* @__PURE__ */ jsx("td", {
                className: "px-3 py-2.5 text-center",
                children: /* @__PURE__ */ jsx(Checkbox, {
                  checked: u.isAdmin,
                  onCheckedChange: (v) => setRole.mutate({
                    userId: u.id,
                    role: "admin",
                    enabled: !!v
                  })
                })
              }),
              /* @__PURE__ */ jsx("td", {
                className: "px-3 py-2.5 text-center",
                children: /* @__PURE__ */ jsx(Checkbox, {
                  checked: u.isVolunteer,
                  onCheckedChange: (v) => setRole.mutate({
                    userId: u.id,
                    role: "volunteer",
                    enabled: !!v
                  })
                })
              }),
              /* @__PURE__ */ jsx("td", {
                className: "px-3 py-2.5 text-center",
                children: u.isVolunteer ? /* @__PURE__ */ jsx(Badge, {
                  variant: "secondary",
                  className: "tabular-nums",
                  children: u.assignedCount
                }) : /* @__PURE__ */ jsx("span", {
                  className: "text-xs text-muted-foreground",
                  children: "\u2014"
                })
              }),
              /* @__PURE__ */ jsx("td", {
                className: "px-3 py-2.5 text-right",
                children: u.isVolunteer && data && /* @__PURE__ */ jsx(AssignEventsDialog, {
                  user: u,
                  events: data.events,
                  assignedEventIds: new Set(data.assignments.filter((a) => a.user_id === u.id).map((a) => a.event_id)),
                  onToggle: (eventId, assigned) => toggleAssignment.mutate({
                    userId: u.id,
                    eventId,
                    assigned
                  })
                })
              })
            ]
          }, u.id)), !isLoading && rows.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", {
            colSpan: 5,
            className: "px-3 py-8 text-center text-muted-foreground",
            children: "No users match."
          }) })] })]
        })
      }),
      /* @__PURE__ */ jsxs("div", {
        className: "mt-4 flex gap-4 text-xs text-muted-foreground",
        children: [/* @__PURE__ */ jsxs("span", {
          className: "flex items-center gap-1",
          children: [/* @__PURE__ */ jsx(Shield, { className: "w-3 h-3" }), "Admin = full access"]
        }), /* @__PURE__ */ jsxs("span", {
          className: "flex items-center gap-1",
          children: [/* @__PURE__ */ jsx(ScanLine, { className: "w-3 h-3" }), "Volunteer = can scan assigned events"]
        })]
      })
    ]
  });
}
function AssignEventsDialog({ user, events, assignedEventIds, onToggle }) {
  const [open, setOpen] = useState(false);
  return /* @__PURE__ */ jsxs(Dialog, {
    open,
    onOpenChange: setOpen,
    children: [/* @__PURE__ */ jsx(DialogTrigger, {
      asChild: true,
      children: /* @__PURE__ */ jsxs(Button, {
        variant: "outline",
        size: "sm",
        children: [/* @__PURE__ */ jsx(Settings2, { className: "w-3 h-3 mr-1" }), "Events"]
      })
    }), /* @__PURE__ */ jsxs(DialogContent, {
      className: "max-w-md",
      children: [/* @__PURE__ */ jsxs(DialogHeader, { children: [/* @__PURE__ */ jsxs(DialogTitle, {
        className: "flex items-center gap-2",
        children: [/* @__PURE__ */ jsx(UserCog, { className: "w-4 h-4" }), "Assign events"]
      }), /* @__PURE__ */ jsx("p", {
        className: "text-xs text-muted-foreground",
        children: user.full_name || user.email
      })] }), /* @__PURE__ */ jsxs("div", {
        className: "max-h-96 overflow-y-auto space-y-1",
        children: [events.length === 0 && /* @__PURE__ */ jsx("p", {
          className: "text-sm text-muted-foreground py-4 text-center",
          children: "No events yet."
        }), events.map((e) => {
          return /* @__PURE__ */ jsxs("label", {
            className: "flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-background/60 cursor-pointer",
            children: [/* @__PURE__ */ jsx(Checkbox, {
              checked: assignedEventIds.has(e.id),
              onCheckedChange: (v) => onToggle(e.id, !!v)
            }), /* @__PURE__ */ jsxs("div", {
              className: "flex-1",
              children: [/* @__PURE__ */ jsx("div", {
                className: "text-sm font-medium",
                children: e.name
              }), /* @__PURE__ */ jsx("div", {
                className: "text-xs text-muted-foreground",
                children: new Date(e.event_date).toLocaleDateString()
              })]
            })]
          }, e.id);
        })]
      })]
    })]
  });
}
function GatePassManager() {
  const queryClient = useQueryClient();
  const { data: passes, isLoading } = useQuery({
    queryKey: ["gatePasses-admin"],
    queryFn: () => gatePassService.getAllPasses()
  });
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }) => {
      await gatePassService.updateStatus(id, status);
    },
    onSuccess: () => {
      toast.success("Gate pass status updated");
      queryClient.invalidateQueries({ queryKey: ["gatePasses-admin"] });
    },
    onError: (e) => toast.error(e.message)
  });
  if (isLoading)
    return /* @__PURE__ */ jsx("div", {
      className: "text-muted-foreground p-8",
      children: "Loading gate passes..."
    });
  if (!(passes == null ? void 0 : passes.length))
    return /* @__PURE__ */ jsx("div", {
      className: "text-muted-foreground p-8",
      children: "No gate passes requested yet."
    });
  return /* @__PURE__ */ jsxs("div", {
    className: "space-y-6",
    children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
      className: "text-2xl font-bold mb-1",
      children: "Gate Passes"
    }), /* @__PURE__ */ jsx("p", {
      className: "text-muted-foreground text-sm",
      children: "Review and approve entry gate passes."
    })] }), /* @__PURE__ */ jsx("div", {
      className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3",
      children: passes.map((pass) => /* @__PURE__ */ jsxs("div", {
        className: "rounded-xl border border-border/60 bg-card/60 overflow-hidden flex flex-col",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "aspect-square bg-muted relative group",
          children: [/* @__PURE__ */ jsx("img", {
            src: pass.photo_url,
            alt: "Gate Pass Photo",
            className: "w-full h-full object-cover"
          }), /* @__PURE__ */ jsx("div", {
            className: "absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity",
            children: /* @__PURE__ */ jsxs("a", {
              href: pass.photo_url,
              target: "_blank",
              rel: "noreferrer",
              className: "text-white flex items-center gap-2",
              children: [/* @__PURE__ */ jsx(ExternalLink, { className: "w-4 h-4" }), " View full"]
            })
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "p-4 flex flex-col flex-1",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "mb-4",
            children: [
              /* @__PURE__ */ jsx("div", {
                className: "font-medium truncate",
                children: pass.user_email || pass.user_id
              }),
              /* @__PURE__ */ jsxs("div", {
                className: "text-xs text-muted-foreground mt-1",
                children: ["Requested: ", new Date(pass.created_at).toLocaleDateString()]
              }),
              /* @__PURE__ */ jsxs("div", {
                className: "mt-2",
                children: [
                  pass.status === "pending" && /* @__PURE__ */ jsx("span", {
                    className: "text-xs bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded-full",
                    children: "Pending"
                  }),
                  pass.status === "approved" && /* @__PURE__ */ jsx("span", {
                    className: "text-xs bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-0.5 rounded-full",
                    children: "Approved"
                  }),
                  pass.status === "rejected" && /* @__PURE__ */ jsx("span", {
                    className: "text-xs bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded-full",
                    children: "Rejected"
                  })
                ]
              })
            ]
          }), /* @__PURE__ */ jsxs("div", {
            className: "mt-auto space-y-2",
            children: [pass.status === "pending" && /* @__PURE__ */ jsxs("div", {
              className: "flex gap-2",
              children: [/* @__PURE__ */ jsxs(Button, {
                size: "sm",
                variant: "outline",
                className: "flex-1 hover:bg-green-500/10 hover:text-green-500 hover:border-green-500/50",
                onClick: () => updateStatus.mutate({
                  id: pass.id,
                  status: "approved"
                }),
                disabled: updateStatus.isPending,
                children: [/* @__PURE__ */ jsx(Check, { className: "w-4 h-4 mr-1" }), " Approve"]
              }), /* @__PURE__ */ jsxs(Button, {
                size: "sm",
                variant: "outline",
                className: "flex-1 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50",
                onClick: () => updateStatus.mutate({
                  id: pass.id,
                  status: "rejected"
                }),
                disabled: updateStatus.isPending,
                children: [/* @__PURE__ */ jsx(X, { className: "w-4 h-4 mr-1" }), " Reject"]
              })]
            }), pass.status === "approved" && /* @__PURE__ */ jsx(PDFDownloadLink, {
              document: /* @__PURE__ */ jsx(GatePassPDF, {
                passId: pass.id,
                userEmail: pass.user_email || "User",
                photoUrl: pass.photo_url
              }),
              fileName: `festa-gate-pass-${pass.id}.pdf`,
              children: ({ loading }) => /* @__PURE__ */ jsxs(Button, {
                size: "sm",
                variant: "outline",
                className: "w-full",
                disabled: loading,
                children: [/* @__PURE__ */ jsx(FileText, { className: "w-4 h-4 mr-2" }), loading ? "Loading PDF..." : "Download PDF"]
              })
            })]
          })]
        })]
      }, pass.id))
    })]
  });
}
var mockEvents = [
  {
    name: "Neon Nights: Battle of the Bands",
    cat: "Cultural",
    venue: "Main Auditorium",
    desc: "The ultimate showdown of the best college bands.",
    type: "Pro Show"
  },
  {
    name: "HackFest 2026",
    cat: "Tech",
    venue: "Computer Lab 1",
    desc: "48-hour continuous hackathon to build the next big thing.",
    type: "Hackathon"
  },
  {
    name: "RoboWars: Steel & Sparks",
    cat: "Tech",
    venue: "Engineering Courtyard",
    desc: "Custom built robots battle it out in the arena.",
    type: "Competition"
  },
  {
    name: "Fashion Walk",
    cat: "Cultural",
    venue: "Open Air Theatre",
    desc: "Annual fashion show featuring student designers and models.",
    type: "Pro Show"
  },
  {
    name: "E-Sports Tournament: Valorant",
    cat: "Sports",
    venue: "Gaming Arena",
    desc: "5v5 tactical shooter tournament with cash prizes.",
    type: "Competition"
  },
  {
    name: "Startup Pitch Deck",
    cat: "Business",
    venue: "Seminar Hall",
    desc: "Pitch your startup idea to real investors.",
    type: "Workshop"
  },
  {
    name: "Standup Comedy Night",
    cat: "Cultural",
    venue: "Main Auditorium",
    desc: "Laugh out loud with top standup comedians.",
    type: "Pro Show"
  },
  {
    name: "AI/ML Workshop",
    cat: "Tech",
    venue: "Lab 3",
    desc: "Hands-on workshop on training neural networks.",
    type: "Workshop"
  },
  {
    name: "Inter-College Debate",
    cat: "Literary",
    venue: "Conference Room A",
    desc: "War of words on current global topics.",
    type: "Competition"
  },
  {
    name: "Photography Walk",
    cat: "Art",
    venue: "Campus Grounds",
    desc: "Guided photography tour around the scenic campus.",
    type: "Workshop"
  },
  {
    name: "Dance Off: Solo & Group",
    cat: "Cultural",
    venue: "Open Air Theatre",
    desc: "Showcase your best moves in front of celebrity judges.",
    type: "Competition"
  },
  {
    name: "Cybersecurity Capture The Flag",
    cat: "Tech",
    venue: "Computer Lab 2",
    desc: "Find the vulnerabilities and capture the flag.",
    type: "Hackathon"
  },
  {
    name: "Street Play (Nukkad Natak)",
    cat: "Cultural",
    venue: "Student Plaza",
    desc: "Powerful social messages delivered through street theatre.",
    type: "Competition"
  },
  {
    name: "IoT Home Automation Build",
    cat: "Tech",
    venue: "Electronics Lab",
    desc: "Build your own smart home devices from scratch.",
    type: "Workshop"
  },
  {
    name: "Chess Masters",
    cat: "Sports",
    venue: "Library Reading Room",
    desc: "Rapid chess tournament.",
    type: "Competition"
  },
  {
    name: "Food Fest: Culinary Wars",
    cat: "Misc",
    venue: "Cafeteria Grounds",
    desc: "Students compete to make the best street food.",
    type: "Misc"
  },
  {
    name: "Short Film Festival",
    cat: "Art",
    venue: "Seminar Hall",
    desc: "Screening of student-made short films.",
    type: "Pro Show"
  },
  {
    name: "Guest Lecture: Future of Space Tech",
    cat: "Tech",
    venue: "Main Auditorium",
    desc: "Talk by a leading ISRO scientist.",
    type: "Workshop"
  },
  {
    name: "Treasure Hunt",
    cat: "Misc",
    venue: "Entire Campus",
    desc: "Solve clues and find the hidden treasure.",
    type: "Competition"
  },
  {
    name: "Closing Ceremony & DJ Night",
    cat: "Cultural",
    venue: "Main Field",
    desc: "The grand finale with an EDM night.",
    type: "Pro Show"
  }
];
async function seedDatabase() {
  try {
    const batch = writeBatch(db);
    const now = /* @__PURE__ */ new Date();
    for (let i = 0; i < mockEvents.length; i++) {
      const e = mockEvents[i];
      const eventRef = doc(collection(db, "events"));
      const eventDate = /* @__PURE__ */ new Date();
      eventDate.setDate(now.getDate() + (i - 2));
      batch.set(eventRef, {
        name: e.name,
        description: e.desc,
        category: e.cat,
        venue: e.venue,
        event_date: eventDate.toISOString(),
        starts_at: eventDate.toISOString(),
        is_published: true,
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      const numItems = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < numItems; j++) {
        const itemRef = doc(collection(db, `events/${eventRef.id}/items`));
        const price = Math.random() > 0.5 ? 0 : Math.floor(Math.random() * 50) * 100;
        const capacity = Math.floor(Math.random() * 100) + 20;
        batch.set(itemRef, {
          name: numItems === 1 ? "General Entry" : `Pass Type ${j + 1}`,
          price_cents: price,
          capacity,
          booked_count: Math.floor(Math.random() * (capacity / 2)),
          available: true
        });
      }
    }
    await batch.commit();
    toast.success("Successfully seeded 20 events!");
  } catch (error) {
    console.error("Error seeding:", error);
    toast.error("Failed to seed database.");
  }
}
var Switch = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(SwitchPrimitives.Root, {
  className: cn("peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input", className),
  ...props,
  ref,
  children: /* @__PURE__ */ jsx(SwitchPrimitives.Thumb, { className: cn("pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0") })
}));
Switch.displayName = SwitchPrimitives.Root.displayName;
var emptyEvent = {
  name: "",
  description: "",
  event_date: "",
  venue: "",
  is_published: false
};
function AdminPage() {
  var _a, _b, _c, _d, _e;
  const { isAdmin, loading, user } = useAuth();
  const qc = useQueryClient();
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    enabled: isAdmin,
    queryFn: async () => {
      var _a2, _b2, _c2, _d2;
      const [events2, tickets, used, users] = await Promise.all([
        getCountFromServer(collection(db, "events")),
        getCountFromServer(collection(db, "tickets")),
        getCountFromServer(query(collection(db, "tickets"), where("status", "==", "used"))),
        getCountFromServer(collection(db, "users"))
      ]);
      return {
        events: (_a2 = events2.data().count) != null ? _a2 : 0,
        tickets: (_b2 = tickets.data().count) != null ? _b2 : 0,
        used: (_c2 = used.data().count) != null ? _c2 : 0,
        users: (_d2 = users.data().count) != null ? _d2 : 0
      };
    }
  });
  const { data: events } = useQuery({
    queryKey: ["admin-events"],
    enabled: isAdmin,
    queryFn: async () => {
      const evs = await eventsService.getEvents(false);
      const allItems = (await getDocs(collectionGroup(db, "items"))).docs.map((d) => ({
        id: d.id,
        ...d.data()
      }));
      return evs.map((e) => ({
        ...e,
        items: allItems.filter((i) => i.event_id === e.id)
      }));
    }
  });
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-events"] });
    qc.invalidateQueries({ queryKey: ["events"] });
  };
  const createEvent = useMutation({
    mutationFn: async (vals) => {
      await eventsService.createEvent({
        ...vals,
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      });
    },
    onSuccess: () => {
      invalidate();
      toast.success("Event created");
    },
    onError: (e) => toast.error(e.message)
  });
  const updateEvent = useMutation({
    mutationFn: async ({ id, vals }) => {
      await eventsService.updateEvent(id, {
        ...vals,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      });
    },
    onSuccess: () => {
      invalidate();
      toast.success("Event updated");
    },
    onError: (e) => toast.error(e.message)
  });
  const createItem = useMutation({
    mutationFn: async (vals) => {
      const { event_id, ...data } = vals;
      await eventsService.createEventItem(event_id, {
        ...data,
        booked_count: 0
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-events"] });
      toast.success("Item added");
    },
    onError: (e) => toast.error(e.message)
  });
  const deleteEvent = useMutation({
    mutationFn: async (id) => {
      await eventsService.deleteEvent(id);
    },
    onSuccess: () => {
      invalidate();
      toast.success("Event deleted");
    },
    onError: (e) => toast.error(e.message)
  });
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
          /* @__PURE__ */ jsx("p", {
            className: "text-muted-foreground mt-2",
            children: "You're signed in but don't have admin role yet."
          }),
          /* @__PURE__ */ jsxs("div", {
            className: "mt-6 rounded-xl bg-card/60 border border-border p-4 text-left text-sm",
            children: [
              /* @__PURE__ */ jsx("p", {
                className: "font-semibold mb-2",
                children: "Bootstrap your first admin:"
              }),
              /* @__PURE__ */ jsx("p", {
                className: "text-muted-foreground",
                children: "In the backend SQL editor, run:"
              }),
              /* @__PURE__ */ jsx("pre", {
                className: "mt-2 text-xs bg-background/60 p-3 rounded font-mono overflow-auto",
                children: `INSERT INTO user_roles(user_id, role)
VALUES ('${(_a = user == null ? void 0 : user.id) != null ? _a : "YOUR_USER_ID"}', 'admin');`
              })
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
          className: "flex items-center justify-between mb-6",
          children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
            className: "text-3xl font-bold",
            children: "Admin"
          }), /* @__PURE__ */ jsx("p", {
            className: "text-muted-foreground",
            children: "Manage events, items, and check-ins."
          })] }), /* @__PURE__ */ jsxs("div", {
            className: "flex items-center gap-3",
            children: [/* @__PURE__ */ jsx(Button, {
              variant: "outline",
              onClick: () => seedDatabase(),
              className: "text-muted-foreground",
              children: "Seed DB"
            }), /* @__PURE__ */ jsx(EventDialog, {
              mode: "create",
              onSubmit: (v) => createEvent.mutate(v),
              trigger: /* @__PURE__ */ jsxs(Button, {
                className: "gradient-gold text-primary-foreground hover:opacity-90",
                children: [/* @__PURE__ */ jsx(Plus, { className: "w-4 h-4 mr-1.5" }), "New event"]
              })
            })]
          })]
        }),
        /* @__PURE__ */ jsxs("div", {
          className: "grid grid-cols-2 md:grid-cols-4 gap-3 mb-8",
          children: [
            /* @__PURE__ */ jsx(StatCard, {
              icon: Calendar,
              label: "Events",
              value: (_b = stats == null ? void 0 : stats.events) != null ? _b : 0
            }),
            /* @__PURE__ */ jsx(StatCard, {
              icon: Ticket,
              label: "Tickets sold",
              value: (_c = stats == null ? void 0 : stats.tickets) != null ? _c : 0
            }),
            /* @__PURE__ */ jsx(StatCard, {
              icon: ScanLine,
              label: "Checked in",
              value: (_d = stats == null ? void 0 : stats.used) != null ? _d : 0
            }),
            /* @__PURE__ */ jsx(StatCard, {
              icon: Users,
              label: "Users",
              value: (_e = stats == null ? void 0 : stats.users) != null ? _e : 0
            })
          ]
        }),
        /* @__PURE__ */ jsxs("div", {
          className: "space-y-4",
          children: [!(events == null ? void 0 : events.length) && /* @__PURE__ */ jsxs("div", {
            className: "rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground",
            children: [
              "No events yet. Click ",
              /* @__PURE__ */ jsx("span", {
                className: "text-foreground font-medium",
                children: "New event"
              }),
              " to create one."
            ]
          }), events == null ? void 0 : events.map((e) => {
            var _a2, _b2, _c2, _d2;
            return /* @__PURE__ */ jsxs("div", {
              className: "rounded-2xl border border-border/60 bg-card/60 p-6",
              children: [/* @__PURE__ */ jsxs("div", {
                className: "flex items-start justify-between gap-4",
                children: [/* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsxs("div", {
                    className: "flex items-center gap-2",
                    children: [/* @__PURE__ */ jsx("h3", {
                      className: "text-xl font-bold",
                      children: e.name
                    }), /* @__PURE__ */ jsx("span", {
                      className: `text-xs px-2 py-0.5 rounded-full border ${e.is_published ? "border-success/40 bg-success/10 text-success" : "border-border bg-muted text-muted-foreground"}`,
                      children: e.is_published ? "Published" : "Draft"
                    })]
                  }),
                  /* @__PURE__ */ jsxs("p", {
                    className: "text-sm text-muted-foreground mt-1",
                    children: [
                      new Date(e.event_date).toLocaleDateString(),
                      " \xB7 ",
                      (_a2 = e.venue) != null ? _a2 : "\u2014"
                    ]
                  }),
                  e.description && /* @__PURE__ */ jsx("p", {
                    className: "text-sm text-muted-foreground mt-2 max-w-2xl",
                    children: e.description
                  })
                ] }), /* @__PURE__ */ jsxs("div", {
                  className: "flex flex-wrap gap-2 justify-end",
                  children: [
                    /* @__PURE__ */ jsx(Button, {
                      variant: "outline",
                      size: "sm",
                      onClick: () => updateEvent.mutate({
                        id: e.id,
                        vals: { is_published: !e.is_published }
                      }),
                      children: e.is_published ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(EyeOff, { className: "w-3.5 h-3.5 mr-1" }), "Unpublish"] }) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Eye, { className: "w-3.5 h-3.5 mr-1" }), "Publish"] })
                    }),
                    /* @__PURE__ */ jsx(EventDialog, {
                      mode: "edit",
                      initial: {
                        name: e.name,
                        description: (_b2 = e.description) != null ? _b2 : "",
                        event_date: e.event_date,
                        venue: (_c2 = e.venue) != null ? _c2 : "",
                        is_published: e.is_published
                      },
                      onSubmit: (vals) => updateEvent.mutate({
                        id: e.id,
                        vals
                      }),
                      trigger: /* @__PURE__ */ jsx(Button, {
                        variant: "ghost",
                        size: "icon",
                        children: /* @__PURE__ */ jsx(Pencil, { className: "w-4 h-4" })
                      })
                    }),
                    /* @__PURE__ */ jsx(NewItemDialog, {
                      eventId: e.id,
                      onCreate: (v) => createItem.mutate(v)
                    }),
                    /* @__PURE__ */ jsx(Button, {
                      variant: "ghost",
                      size: "icon",
                      onClick: () => {
                        if (confirm("Delete this event and all its items/tickets?"))
                          deleteEvent.mutate(e.id);
                      },
                      children: /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4 text-destructive" })
                    })
                  ]
                })]
              }), /* @__PURE__ */ jsx("div", {
                className: "mt-4 space-y-2",
                children: ((_d2 = e.items) == null ? void 0 : _d2.length) ? e.items.map((it) => /* @__PURE__ */ jsxs("div", {
                  className: "flex items-center justify-between rounded-lg bg-background/40 px-3 py-2 text-sm",
                  children: [/* @__PURE__ */ jsx("span", { children: it.name }), /* @__PURE__ */ jsx("span", {
                    className: "text-muted-foreground",
                    children: it.price_cents === 0 ? "Free" : `\u20B9${(it.price_cents / 100).toFixed(0)}`
                  })]
                }, it.id)) : /* @__PURE__ */ jsx("p", {
                  className: "text-xs text-muted-foreground",
                  children: "No items yet \u2014 add one."
                })
              })]
            }, e.id);
          })]
        }),
        /* @__PURE__ */ jsx("div", {
          className: "mt-10",
          children: /* @__PURE__ */ jsx(TeamManager, {})
        }),
        /* @__PURE__ */ jsx("div", {
          className: "mt-16",
          children: /* @__PURE__ */ jsx(GatePassManager, {})
        })
      ]
    })]
  });
}
function StatCard({ icon: Icon, label, value }) {
  return /* @__PURE__ */ jsxs("div", {
    className: "rounded-2xl border border-border/60 bg-card/60 p-5",
    children: [
      /* @__PURE__ */ jsx(Icon, { className: "w-5 h-5 text-primary mb-2" }),
      /* @__PURE__ */ jsx("div", {
        className: "text-3xl font-bold",
        children: value
      }),
      /* @__PURE__ */ jsx("div", {
        className: "text-xs text-muted-foreground",
        children: label
      })
    ]
  });
}
function EventDialog({ mode, initial, onSubmit, trigger }) {
  var _a;
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initial != null ? initial : emptyEvent);
  return /* @__PURE__ */ jsxs(Dialog, {
    open,
    onOpenChange: (o) => {
      setOpen(o);
      if (o)
        setForm(initial != null ? initial : emptyEvent);
    },
    children: [/* @__PURE__ */ jsx(DialogTrigger, {
      asChild: true,
      children: trigger
    }), /* @__PURE__ */ jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: mode === "create" ? "Create event" : "Edit event" }) }),
      /* @__PURE__ */ jsxs("div", {
        className: "space-y-3",
        children: [
          /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(Label, { children: "Name" }), /* @__PURE__ */ jsx(Input, {
            value: form.name,
            onChange: (e) => setForm({
              ...form,
              name: e.target.value
            })
          })] }),
          /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(Label, { children: "Description" }), /* @__PURE__ */ jsx(Textarea, {
            value: form.description,
            onChange: (e) => setForm({
              ...form,
              description: e.target.value
            })
          })] }),
          /* @__PURE__ */ jsxs("div", {
            className: "grid grid-cols-2 gap-3",
            children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(Label, { children: "Date" }), /* @__PURE__ */ jsx(Input, {
              type: "date",
              value: (_a = form.event_date) == null ? void 0 : _a.slice(0, 10),
              onChange: (e) => setForm({
                ...form,
                event_date: e.target.value
              })
            })] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(Label, { children: "Venue" }), /* @__PURE__ */ jsx(Input, {
              value: form.venue,
              onChange: (e) => setForm({
                ...form,
                venue: e.target.value
              })
            })] })]
          }),
          /* @__PURE__ */ jsxs("div", {
            className: "flex items-center justify-between rounded-lg border border-border/60 p-3",
            children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(Label, {
              className: "text-sm",
              children: "Published"
            }), /* @__PURE__ */ jsx("p", {
              className: "text-xs text-muted-foreground",
              children: "Visible to students on the home page."
            })] }), /* @__PURE__ */ jsx(Switch, {
              checked: form.is_published,
              onCheckedChange: (v) => setForm({
                ...form,
                is_published: v
              })
            })]
          })
        ]
      }),
      /* @__PURE__ */ jsx(DialogFooter, { children: /* @__PURE__ */ jsx(Button, {
        onClick: () => {
          onSubmit(form);
          setOpen(false);
        },
        disabled: !form.name || !form.event_date,
        children: mode === "create" ? "Create" : "Save changes"
      }) })
    ] })]
  });
}
function NewItemDialog({ eventId, onCreate }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    starts_at: "",
    venue: "",
    price: "0",
    category: ""
  });
  return /* @__PURE__ */ jsxs(Dialog, {
    open,
    onOpenChange: setOpen,
    children: [/* @__PURE__ */ jsx(DialogTrigger, {
      asChild: true,
      children: /* @__PURE__ */ jsxs(Button, {
        variant: "outline",
        size: "sm",
        children: [/* @__PURE__ */ jsx(Plus, { className: "w-3 h-3 mr-1" }), "Item"]
      })
    }), /* @__PURE__ */ jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "Add item" }) }),
      /* @__PURE__ */ jsxs("div", {
        className: "space-y-3",
        children: [
          /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(Label, { children: "Name" }), /* @__PURE__ */ jsx(Input, {
            value: form.name,
            onChange: (e) => setForm({
              ...form,
              name: e.target.value
            })
          })] }),
          /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(Label, { children: "Description" }), /* @__PURE__ */ jsx(Textarea, {
            value: form.description,
            onChange: (e) => setForm({
              ...form,
              description: e.target.value
            })
          })] }),
          /* @__PURE__ */ jsxs("div", {
            className: "grid grid-cols-2 gap-3",
            children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(Label, { children: "Category" }), /* @__PURE__ */ jsx(Input, {
              placeholder: "Dance, Music\u2026",
              value: form.category,
              onChange: (e) => setForm({
                ...form,
                category: e.target.value
              })
            })] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(Label, { children: "Price (\u20B9)" }), /* @__PURE__ */ jsx(Input, {
              type: "number",
              min: "0",
              value: form.price,
              onChange: (e) => setForm({
                ...form,
                price: e.target.value
              })
            })] })]
          }),
          /* @__PURE__ */ jsxs("div", {
            className: "grid grid-cols-2 gap-3",
            children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(Label, { children: "Starts at" }), /* @__PURE__ */ jsx(Input, {
              type: "datetime-local",
              value: form.starts_at,
              onChange: (e) => setForm({
                ...form,
                starts_at: e.target.value
              })
            })] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(Label, { children: "Venue" }), /* @__PURE__ */ jsx(Input, {
              value: form.venue,
              onChange: (e) => setForm({
                ...form,
                venue: e.target.value
              })
            })] })]
          })
        ]
      }),
      /* @__PURE__ */ jsx(DialogFooter, { children: /* @__PURE__ */ jsx(Button, {
        onClick: () => {
          onCreate({
            event_id: eventId,
            name: form.name,
            description: form.description,
            starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : void 0,
            venue: form.venue,
            price_cents: Math.round(parseFloat(form.price || "0") * 100),
            category: form.category
          });
          setOpen(false);
          setForm({
            name: "",
            description: "",
            starts_at: "",
            venue: "",
            price: "0",
            category: ""
          });
        },
        disabled: !form.name,
        children: "Add"
      }) })
    ] })]
  });
}

export { AdminPage as component };
//# sourceMappingURL=admin-BsqHaqAC.mjs.map
