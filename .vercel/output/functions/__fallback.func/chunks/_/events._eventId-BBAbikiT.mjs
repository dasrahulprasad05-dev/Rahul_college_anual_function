import { R as Route, u as useAuth, d as db } from './router-j_9pWM7h.mjs';
import { e as eventsService } from './events-CWfQmYOn.mjs';
import { B as Button } from './button-DRsC1qZi.mjs';
import { N as Navbar } from './Navbar-DzHODt_V.mjs';
import { t as ticketsService } from './tickets-DBrl0I-g.mjs';
import { f as feedbackService } from './feedback-DFqX3JN0.mjs';
import { sendTicketConfirmation } from './ticket-emails-CQbKuzYy.mjs';
import * as React from 'react';
import { useNavigate, Link, useRouter, isRedirect } from '@tanstack/react-router';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { getDocs, query, collection, where } from 'firebase/firestore';
import { toast } from 'sonner';
import { ArrowLeft, Star, Calendar, MapPin, Clock, Ticket } from 'lucide-react';
import 'firebase/auth';
import 'firebase/app';
import 'firebase/storage';
import 'zod';
import '@radix-ui/react-slot';
import 'class-variance-authority';
import 'clsx';
import 'tailwind-merge';
import 'framer-motion';
import './server-BaZlr8n8.mjs';
import 'node:async_hooks';
import '@tanstack/router-core';
import '@tanstack/router-core/ssr/client';
import '@tanstack/react-router/ssr/server';
import 'rou3';
import 'srvx';
import 'seroval';
import '@tanstack/history';
import '@tanstack/router-core/ssr/server';

function useServerFn(serverFn) {
  const router = useRouter();
  return React.useCallback(async (...args) => {
    try {
      const res = await serverFn(...args);
      if (isRedirect(res)) throw res;
      return res;
    } catch (err) {
      if (isRedirect(err)) {
        err.options._fromLocation = router.stores.location.get();
        return router.navigate(router.resolveRedirect(err).options);
      }
      throw err;
    }
  }, [router, serverFn]);
}
function EventDetail() {
  const { eventId } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const sendConfirmation = useServerFn(sendTicketConfirmation);
  const { data: event } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      const e = await eventsService.getEvent(eventId);
      if (!e) throw new Error("Event not found");
      return e;
    }
  });
  const { data: items, isLoading } = useQuery({
    queryKey: ["items", eventId],
    queryFn: async () => {
      return eventsService.getEventItems(eventId);
    }
  });
  const { data: myTickets } = useQuery({
    queryKey: [
      "my-tickets-for-event",
      eventId,
      user == null ? void 0 : user.id
    ],
    enabled: !!user,
    queryFn: async () => {
      return (await getDocs(query(collection(db, "tickets"), where("user_id", "==", user.id), where("event_id", "==", eventId)))).docs.map((d) => d.data());
    }
  });
  const bookedItemIds = new Set((myTickets != null ? myTickets : []).filter((t) => t.status !== "cancelled").map((t) => t.item_id));
  const book = useMutation({
    mutationFn: async (item) => {
      if (!user) throw new Error("Please sign in");
      return { id: await ticketsService.bookTicket({
        userId: user.id,
        userEmail: user.email,
        eventId,
        eventName: event.name,
        venue: event.venue,
        itemId: item.id,
        itemName: item.name
      }) };
    },
    onSuccess: (ticket) => {
      toast.success("Ticket booked! Check 'My Tickets'.");
      qc.invalidateQueries({ queryKey: ["my-tickets-for-event", eventId] });
      qc.invalidateQueries({ queryKey: ["tickets"] });
      qc.invalidateQueries({ queryKey: ["items", eventId] });
      if (ticket == null ? void 0 : ticket.id) sendConfirmation({ data: { ticketId: ticket.id } }).then((r) => {
        if (r == null ? void 0 : r.ok) toast.success("Confirmation email sent");
      }).catch((e) => console.warn("Email send failed", e));
    },
    onError: (e) => toast.error(e.message)
  });
  const { data: feedbackData } = useQuery({
    queryKey: ["feedback", eventId],
    queryFn: () => feedbackService.getEventFeedback(eventId)
  });
  const avgRating = (feedbackData == null ? void 0 : feedbackData.length) ? (feedbackData.reduce((acc, f) => acc + f.rating, 0) / feedbackData.length).toFixed(1) : null;
  return /* @__PURE__ */ jsxs("div", {
    className: "min-h-screen",
    children: [/* @__PURE__ */ jsx(Navbar, {}), /* @__PURE__ */ jsxs("div", {
      className: "max-w-4xl mx-auto px-4 py-8",
      children: [
        /* @__PURE__ */ jsxs(Link, {
          to: "/",
          className: "inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6",
          children: [/* @__PURE__ */ jsx(ArrowLeft, { className: "w-4 h-4 mr-1" }), "Back to events"]
        }),
        event && /* @__PURE__ */ jsxs("div", {
          className: "rounded-2xl border border-border/60 bg-card/60 backdrop-blur p-8 mb-8",
          children: [
            /* @__PURE__ */ jsxs("div", {
              className: "flex flex-col md:flex-row md:items-center justify-between gap-4",
              children: [/* @__PURE__ */ jsx("h1", {
                className: "text-4xl font-bold text-gradient-gold",
                children: event.name
              }), avgRating && /* @__PURE__ */ jsxs("div", {
                className: "flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20",
                children: [
                  /* @__PURE__ */ jsx(Star, { className: "w-4 h-4 text-accent fill-accent" }),
                  /* @__PURE__ */ jsx("span", {
                    className: "font-semibold text-accent",
                    children: avgRating
                  }),
                  /* @__PURE__ */ jsxs("span", {
                    className: "text-xs text-muted-foreground",
                    children: [
                      "(",
                      feedbackData == null ? void 0 : feedbackData.length,
                      " reviews)"
                    ]
                  })
                ]
              })]
            }),
            event.description && /* @__PURE__ */ jsx("p", {
              className: "mt-3 text-muted-foreground",
              children: event.description
            }),
            /* @__PURE__ */ jsxs("div", {
              className: "flex flex-wrap gap-4 mt-5 text-sm text-muted-foreground",
              children: [event.event_date && /* @__PURE__ */ jsxs("span", {
                className: "flex items-center gap-1.5",
                children: [/* @__PURE__ */ jsx(Calendar, { className: "w-4 h-4" }), new Date(event.event_date).toLocaleDateString(void 0, { dateStyle: "full" })]
              }), event.venue && /* @__PURE__ */ jsxs("span", {
                className: "flex items-center gap-1.5",
                children: [/* @__PURE__ */ jsx(MapPin, { className: "w-4 h-4" }), event.venue]
              })]
            })
          ]
        }),
        /* @__PURE__ */ jsx("h2", {
          className: "text-2xl font-bold mb-4",
          children: "Items"
        }),
        isLoading ? /* @__PURE__ */ jsx("div", { className: "h-32 rounded-xl bg-card/40 animate-pulse" }) : !(items == null ? void 0 : items.length) ? /* @__PURE__ */ jsx("div", {
          className: "rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground",
          children: "No items added yet."
        }) : /* @__PURE__ */ jsx("div", {
          className: "space-y-3",
          children: items.map((item) => {
            var _a, _b;
            const isBooked = bookedItemIds.has(item.id);
            const capacity = (_a = item.capacity) != null ? _a : null;
            const booked = (_b = item.booked_count) != null ? _b : 0;
            const available = capacity !== null ? capacity - booked : null;
            const soldOut = available !== null && available <= 0;
            return /* @__PURE__ */ jsxs("div", {
              className: "rounded-xl border border-border/60 bg-card/60 p-5 flex flex-col md:flex-row md:items-center gap-4",
              children: [/* @__PURE__ */ jsxs("div", {
                className: "flex-1",
                children: [
                  /* @__PURE__ */ jsxs("div", {
                    className: "flex items-center gap-2",
                    children: [item.category && /* @__PURE__ */ jsx("span", {
                      className: "text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground",
                      children: item.category
                    }), /* @__PURE__ */ jsx("h3", {
                      className: "font-semibold text-lg",
                      children: item.name
                    })]
                  }),
                  item.description && /* @__PURE__ */ jsx("p", {
                    className: "text-sm text-muted-foreground mt-1",
                    children: item.description
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    className: "flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground",
                    children: [item.starts_at && /* @__PURE__ */ jsxs("span", {
                      className: "flex items-center gap-1",
                      children: [/* @__PURE__ */ jsx(Clock, { className: "w-3 h-3" }), new Date(item.starts_at).toLocaleString(void 0, {
                        dateStyle: "medium",
                        timeStyle: "short"
                      })]
                    }), item.venue && /* @__PURE__ */ jsxs("span", {
                      className: "flex items-center gap-1",
                      children: [/* @__PURE__ */ jsx(MapPin, { className: "w-3 h-3" }), item.venue]
                    })]
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    className: "mt-2 text-xs",
                    children: [capacity === null ? /* @__PURE__ */ jsxs("span", {
                      className: "text-muted-foreground",
                      children: [booked, " booked \xB7 unlimited seats"]
                    }) : soldOut ? /* @__PURE__ */ jsx("span", {
                      className: "text-destructive font-medium",
                      children: "Sold out"
                    }) : /* @__PURE__ */ jsxs("span", {
                      className: (available != null ? available : 0) <= 10 ? "text-primary font-medium" : "text-muted-foreground",
                      children: [
                        available,
                        " of ",
                        capacity,
                        " seats left"
                      ]
                    }), capacity !== null && /* @__PURE__ */ jsx("div", {
                      className: "mt-1 h-1.5 w-40 rounded-full bg-muted overflow-hidden",
                      children: /* @__PURE__ */ jsx("div", {
                        className: "h-full gradient-gold",
                        style: { width: `${Math.min(100, booked / Math.max(capacity, 1) * 100)}%` }
                      })
                    })]
                  })
                ]
              }), /* @__PURE__ */ jsxs("div", {
                className: "flex items-center gap-3 md:flex-col md:items-end",
                children: [/* @__PURE__ */ jsx("div", {
                  className: "text-right",
                  children: /* @__PURE__ */ jsx("div", {
                    className: "text-2xl font-bold",
                    children: item.price_cents === 0 ? "Free" : `\u20B9${(item.price_cents / 100).toFixed(0)}`
                  })
                }), isBooked ? /* @__PURE__ */ jsxs(Button, {
                  variant: "outline",
                  disabled: true,
                  children: [/* @__PURE__ */ jsx(Ticket, { className: "w-4 h-4 mr-1.5" }), "Booked"]
                }) : soldOut ? /* @__PURE__ */ jsx(Button, {
                  variant: "outline",
                  disabled: true,
                  children: "Sold out"
                }) : /* @__PURE__ */ jsxs(Button, {
                  onClick: () => user ? book.mutate(item) : navigate({
                    to: "/auth",
                    search: { redirect: `/events/${eventId}` }
                  }),
                  disabled: book.isPending,
                  className: "gradient-gold text-primary-foreground hover:opacity-90",
                  children: [/* @__PURE__ */ jsx(Ticket, { className: "w-4 h-4 mr-1.5" }), item.price_cents === 0 ? "Get ticket" : "Book"]
                })]
              })]
            }, item.id);
          })
        })
      ]
    })]
  });
}

export { EventDetail as component };
//# sourceMappingURL=events._eventId-BBAbikiT.mjs.map
