import { u as useAuth, d as db } from './router-j_9pWM7h.mjs';
import { B as Button } from './button-DRsC1qZi.mjs';
import { D as Dialog, a as DialogTrigger, b as DialogContent, c as DialogHeader, d as DialogTitle, T as Textarea } from './textarea-Ds6mtKuq.mjs';
import { N as Navbar } from './Navbar-DzHODt_V.mjs';
import { e as eventColors } from './event-color-BBcoXhrs.mjs';
import { f as feedbackService } from './feedback-DFqX3JN0.mjs';
import { useState } from 'react';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { getDocs, query, collection, where, getDoc, doc } from 'firebase/firestore';
import { toast } from 'sonner';
import { Sparkles, Clock, MapPin, Calendar, CheckCircle2, MessageSquareHeart, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import 'firebase/auth';
import 'firebase/app';
import 'firebase/storage';
import '@tanstack/react-router';
import 'zod';
import '@radix-ui/react-slot';
import 'class-variance-authority';
import 'clsx';
import 'tailwind-merge';
import '@radix-ui/react-dialog';

function FeedbackModal({ ticketId, eventId }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const submit = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not logged in");
      if (rating === 0) throw new Error("Please select a rating");
      await feedbackService.submitFeedback({
        ticket_id: ticketId,
        event_id: eventId,
        user_id: user.id,
        rating,
        comment
      });
    },
    onSuccess: () => {
      toast.success("Thanks for your feedback!");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["feedback", ticketId] });
    },
    onError: (e) => toast.error(e.message)
  });
  return /* @__PURE__ */ jsxs(Dialog, {
    open,
    onOpenChange: setOpen,
    children: [/* @__PURE__ */ jsx(DialogTrigger, {
      asChild: true,
      children: /* @__PURE__ */ jsxs(Button, {
        size: "sm",
        variant: "outline",
        className: "mt-2 w-full flex items-center justify-center gap-2",
        children: [/* @__PURE__ */ jsx(MessageSquareHeart, { className: "w-4 h-4" }), "Leave Feedback"]
      })
    }), /* @__PURE__ */ jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "How was the event?" }) }),
      /* @__PURE__ */ jsxs("div", {
        className: "py-6 flex flex-col items-center",
        children: [/* @__PURE__ */ jsx("div", {
          className: "flex items-center gap-2 mb-6",
          children: [
            1,
            2,
            3,
            4,
            5
          ].map((star) => /* @__PURE__ */ jsx("button", {
            type: "button",
            className: "focus:outline-none transition-transform hover:scale-110",
            onMouseEnter: () => setHoverRating(star),
            onMouseLeave: () => setHoverRating(0),
            onClick: () => setRating(star),
            children: /* @__PURE__ */ jsx(Star, {
              className: "w-10 h-10 transition-colors",
              fill: (hoverRating || rating) >= star ? "#F5B301" : "transparent",
              color: (hoverRating || rating) >= star ? "#F5B301" : "currentColor"
            })
          }, star))
        }), /* @__PURE__ */ jsx(Textarea, {
          placeholder: "Tell us what you liked or what could be improved...",
          value: comment,
          onChange: (e) => setComment(e.target.value),
          className: "w-full h-24 resize-none"
        })]
      }),
      /* @__PURE__ */ jsx(Button, {
        className: "w-full gradient-gold text-primary-foreground",
        disabled: rating === 0 || submit.isPending,
        onClick: () => submit.mutate(),
        children: submit.isPending ? "Submitting..." : "Submit Feedback"
      })
    ] })]
  });
}
function TicketsPage() {
  const { user } = useAuth();
  const { data: tickets, isLoading } = useQuery({
    queryKey: ["tickets", user == null ? void 0 : user.id],
    enabled: !!user,
    queryFn: async () => {
      const tickets2 = (await getDocs(query(collection(db, "tickets"), where("user_id", "==", user.id)))).docs.map((d) => ({
        id: d.id,
        ...d.data()
      }));
      return (await Promise.all(tickets2.map(async (t) => {
        var _a, _b;
        const itemSnap = await getDoc(doc(db, `events/${t.event_id}/items/${t.item_id}`));
        const itemData = itemSnap.exists() ? itemSnap.data() : null;
        const eventSnap = await getDoc(doc(db, "events", t.event_id));
        const eventData = eventSnap.exists() ? {
          id: eventSnap.id,
          ...eventSnap.data()
        } : null;
        return {
          ...t,
          items: itemData ? {
            name: itemData.name,
            starts_at: (_a = itemData.starts_at) != null ? _a : null,
            venue: (_b = itemData.venue) != null ? _b : null,
            events: eventData ? {
              id: eventData.id,
              name: eventData.name,
              event_date: eventData.event_date
            } : null
          } : null
        };
      }))).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  });
  return /* @__PURE__ */ jsxs("div", {
    className: "min-h-screen",
    children: [/* @__PURE__ */ jsx(Navbar, {}), /* @__PURE__ */ jsxs("div", {
      className: "max-w-5xl mx-auto px-4 py-8",
      children: [
        /* @__PURE__ */ jsxs("h1", {
          className: "font-display text-4xl uppercase mb-2",
          children: ["My ", /* @__PURE__ */ jsx("span", {
            className: "text-gradient-neon",
            children: "Tickets"
          })]
        }),
        /* @__PURE__ */ jsx("p", {
          className: "text-muted-foreground mb-8",
          children: "Each ticket gets its own color and QR \u2014 show it at the gate to scan in."
        }),
        isLoading ? /* @__PURE__ */ jsx("div", {
          className: "grid grid-cols-1 md:grid-cols-2 gap-5",
          children: [1, 2].map((i) => /* @__PURE__ */ jsx("div", { className: "h-80 rounded-2xl bg-card/40 animate-pulse" }, i))
        }) : !(tickets == null ? void 0 : tickets.length) ? /* @__PURE__ */ jsx("div", {
          className: "rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground",
          children: "No tickets yet. Browse events from the home page."
        }) : /* @__PURE__ */ jsx("div", {
          className: "grid grid-cols-1 md:grid-cols-2 gap-5",
          children: tickets.map((t, i) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
            const eventId = (_c = (_b = (_a = t.items) == null ? void 0 : _a.events) == null ? void 0 : _b.id) != null ? _c : t.id;
            const c = eventColors(eventId);
            const used = t.status === "used";
            return /* @__PURE__ */ jsx(motion.div, {
              initial: {
                opacity: 0,
                y: 24
              },
              animate: {
                opacity: 1,
                y: 0
              },
              transition: {
                delay: i * 0.05,
                duration: 0.45
              },
              className: "relative rounded-3xl overflow-hidden p-[1.5px]",
              style: {
                background: c.gradient,
                boxShadow: c.glow
              },
              children: /* @__PURE__ */ jsxs("div", {
                className: "rounded-[calc(1.5rem-1px)] bg-background/95 backdrop-blur overflow-hidden",
                children: [
                  /* @__PURE__ */ jsxs("div", {
                    className: "relative px-6 py-5",
                    style: { background: c.gradient },
                    children: [
                      /* @__PURE__ */ jsx("div", {
                        className: "absolute inset-0 opacity-30 mix-blend-overlay",
                        style: { background: "radial-gradient(circle at 80% 20%, white, transparent 60%)" }
                      }),
                      /* @__PURE__ */ jsxs("div", {
                        className: "relative flex items-start justify-between gap-3 text-white",
                        children: [/* @__PURE__ */ jsxs("div", {
                          className: "min-w-0",
                          children: [/* @__PURE__ */ jsx("div", {
                            className: "text-[10px] tracking-[0.25em] uppercase opacity-80",
                            children: (_f = (_e = (_d = t.items) == null ? void 0 : _d.events) == null ? void 0 : _e.name) != null ? _f : "Event"
                          }), /* @__PURE__ */ jsx("h3", {
                            className: "font-display text-2xl uppercase mt-0.5 line-clamp-2",
                            children: (_g = t.items) == null ? void 0 : _g.name
                          })]
                        }), /* @__PURE__ */ jsx(Sparkles, { className: "w-5 h-5 shrink-0 opacity-90" })]
                      }),
                      /* @__PURE__ */ jsxs("div", {
                        className: "relative flex flex-wrap gap-3 mt-3 text-[11px] text-white/90",
                        children: [
                          ((_h = t.items) == null ? void 0 : _h.starts_at) && /* @__PURE__ */ jsxs("span", {
                            className: "flex items-center gap-1",
                            children: [/* @__PURE__ */ jsx(Clock, { className: "w-3 h-3" }), new Date(t.items.starts_at).toLocaleString(void 0, {
                              dateStyle: "medium",
                              timeStyle: "short"
                            })]
                          }),
                          ((_i = t.items) == null ? void 0 : _i.venue) && /* @__PURE__ */ jsxs("span", {
                            className: "flex items-center gap-1",
                            children: [/* @__PURE__ */ jsx(MapPin, { className: "w-3 h-3" }), t.items.venue]
                          }),
                          !((_j = t.items) == null ? void 0 : _j.starts_at) && ((_l = (_k = t.items) == null ? void 0 : _k.events) == null ? void 0 : _l.event_date) && /* @__PURE__ */ jsxs("span", {
                            className: "flex items-center gap-1",
                            children: [/* @__PURE__ */ jsx(Calendar, { className: "w-3 h-3" }), new Date(t.items.events.event_date).toLocaleDateString()]
                          })
                        ]
                      })
                    ]
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    className: "relative h-4 flex items-center",
                    style: { background: c.soft },
                    children: [
                      /* @__PURE__ */ jsx("div", { className: "absolute -left-2 w-4 h-4 rounded-full bg-background" }),
                      /* @__PURE__ */ jsx("div", { className: "absolute -right-2 w-4 h-4 rounded-full bg-background" }),
                      /* @__PURE__ */ jsx("div", { className: "flex-1 mx-3 border-t border-dashed border-foreground/20" })
                    ]
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    className: "p-6 flex flex-col items-center justify-center bg-white",
                    children: [/* @__PURE__ */ jsx("div", {
                      className: `p-3 rounded-2xl relative ${used ? "opacity-30" : ""}`,
                      style: { background: c.gradient },
                      children: /* @__PURE__ */ jsx("div", {
                        className: "rounded-xl bg-white p-3",
                        children: /* @__PURE__ */ jsx(QRCodeSVG, {
                          value: t.qr_token,
                          size: 176,
                          level: "H",
                          fgColor: `hsl(${c.hue} 80% 28%)`,
                          bgColor: "#ffffff"
                        })
                      })
                    }), /* @__PURE__ */ jsxs("div", {
                      className: "mt-4 text-center",
                      children: [used ? /* @__PURE__ */ jsxs("div", {
                        className: "flex flex-col gap-2",
                        children: [/* @__PURE__ */ jsxs("span", {
                          className: "inline-flex items-center justify-center gap-1 text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground w-fit mx-auto",
                          children: [
                            /* @__PURE__ */ jsx(CheckCircle2, { className: "w-3 h-3" }),
                            "Used ",
                            t.used_at && new Date(t.used_at).toLocaleDateString()
                          ]
                        }), /* @__PURE__ */ jsx(FeedbackModal, {
                          ticketId: t.id,
                          eventId
                        })]
                      }) : t.status === "reserved" ? /* @__PURE__ */ jsx("span", {
                        className: "text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-700",
                        children: "Payment pending"
                      }) : /* @__PURE__ */ jsx("span", {
                        className: "text-xs px-2.5 py-1 rounded-full text-white",
                        style: { background: c.gradient },
                        children: "Valid \xB7 Ready to scan"
                      }), /* @__PURE__ */ jsx("p", {
                        className: "text-[10px] text-muted-foreground mt-2 font-mono tracking-wider",
                        children: t.qr_token.slice(0, 8).toUpperCase()
                      })]
                    })]
                  })
                ]
              })
            }, t.id);
          })
        })
      ]
    })]
  });
}

export { TicketsPage as component };
//# sourceMappingURL=tickets-B1jNHQXs.mjs.map
