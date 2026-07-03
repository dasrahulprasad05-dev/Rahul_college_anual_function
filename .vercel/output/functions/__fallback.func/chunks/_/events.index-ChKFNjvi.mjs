import { e as eventsService } from './events-CWfQmYOn.mjs';
import { N as Navbar } from './Navbar-DzHODt_V.mjs';
import { e as eventColors } from './event-color-BBcoXhrs.mjs';
import { H as HoverColorCard } from './hover-color-card-D9Bpm8P-.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useQuery } from '@tanstack/react-query';
import { Calendar, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import './router-j_9pWM7h.mjs';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/app';
import 'firebase/storage';
import 'react';
import '@tanstack/react-router';
import 'sonner';
import 'zod';
import './button-DRsC1qZi.mjs';
import '@radix-ui/react-slot';
import 'class-variance-authority';
import 'clsx';
import 'tailwind-merge';

function AllEvents() {
  const { data: events, isLoading } = useQuery({
    queryKey: ["events", "all-published"],
    queryFn: async () => {
      return eventsService.getEvents(true);
    }
  });
  return /* @__PURE__ */ jsxs("div", {
    className: "min-h-screen",
    children: [/* @__PURE__ */ jsx(Navbar, {}), /* @__PURE__ */ jsxs("div", {
      className: "max-w-6xl mx-auto px-4 py-12",
      children: [/* @__PURE__ */ jsxs(motion.div, {
        initial: {
          opacity: 0,
          y: 16
        },
        animate: {
          opacity: 1,
          y: 0
        },
        transition: { duration: 0.5 },
        className: "mb-10",
        children: [
          /* @__PURE__ */ jsx("span", {
            className: "text-xs tracking-[0.3em] text-accent uppercase",
            children: "\u2014 Line-up"
          }),
          /* @__PURE__ */ jsxs("h1", {
            className: "font-display text-5xl md:text-6xl mt-2 uppercase",
            children: ["All ", /* @__PURE__ */ jsx("span", {
              className: "text-gradient-neon",
              children: "events"
            })]
          }),
          /* @__PURE__ */ jsx("p", {
            className: "text-muted-foreground mt-3 max-w-xl",
            children: "Tap any card to see items, prices, and live seat counts. Booking takes a single tap once you're signed in."
          })
        ]
      }), isLoading ? /* @__PURE__ */ jsx("div", {
        className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
        children: [
          1,
          2,
          3,
          4,
          5,
          6
        ].map((i) => /* @__PURE__ */ jsx("div", { className: "h-56 rounded-2xl bg-card/40 animate-pulse" }, i))
      }) : !(events == null ? void 0 : events.length) ? /* @__PURE__ */ jsx("div", {
        className: "rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground",
        children: "No events published yet."
      }) : /* @__PURE__ */ jsx("div", {
        className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
        children: events.map((e, i) => {
          const c = eventColors(e.id);
          return /* @__PURE__ */ jsx(motion.div, {
            initial: {
              opacity: 0,
              y: 24
            },
            whileInView: {
              opacity: 1,
              y: 0
            },
            viewport: {
              once: true,
              margin: "-40px"
            },
            transition: {
              delay: i % 6 * 0.06,
              duration: 0.5
            },
            children: /* @__PURE__ */ jsx(HoverColorCard, {
              eventId: e.id,
              name: e.name,
              description: e.description,
              children: /* @__PURE__ */ jsxs("div", {
                className: "relative flex items-center gap-4 text-sm text-muted-foreground",
                children: [e.event_date && /* @__PURE__ */ jsxs("span", {
                  className: "flex items-center gap-1.5",
                  children: [/* @__PURE__ */ jsx(Calendar, {
                    className: "w-4 h-4",
                    style: { color: c.primary }
                  }), new Date(e.event_date).toLocaleDateString(void 0, { dateStyle: "medium" })]
                }), e.venue && /* @__PURE__ */ jsxs("span", {
                  className: "flex items-center gap-1.5",
                  children: [/* @__PURE__ */ jsx(MapPin, {
                    className: "w-4 h-4",
                    style: { color: c.secondary }
                  }), e.venue]
                })]
              })
            }, e.id)
          }, e.id);
        })
      })]
    })]
  });
}

export { AllEvents as component };
//# sourceMappingURL=events.index-ChKFNjvi.mjs.map
