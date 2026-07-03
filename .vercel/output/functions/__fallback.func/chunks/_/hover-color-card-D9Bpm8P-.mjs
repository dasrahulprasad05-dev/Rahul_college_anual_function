import { e as eventColors } from './event-color-BBcoXhrs.mjs';
import { Link } from '@tanstack/react-router';
import { jsxs, jsx } from 'react/jsx-runtime';
import { ArrowRight } from 'lucide-react';

function HoverColorCard({ eventId, name, description, children }) {
  const c = eventColors(eventId);
  return /* @__PURE__ */ jsxs(Link, {
    to: "/events/$eventId",
    params: { eventId },
    className: "group relative block rounded-2xl border border-border/60 bg-card/60 backdrop-blur p-6 overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:border-transparent hover:shadow-2xl h-full",
    children: [
      /* @__PURE__ */ jsx("div", {
        "aria-hidden": true,
        className: "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
        style: {
          background: c.gradient,
          mixBlendMode: "overlay"
        }
      }),
      /* @__PURE__ */ jsx("div", {
        "aria-hidden": true,
        className: "absolute -top-20 -right-20 w-56 h-56 rounded-full blur-3xl opacity-0 group-hover:opacity-80 transition duration-500",
        style: { background: `radial-gradient(circle, ${c.primary}, transparent 70%)` }
      }),
      /* @__PURE__ */ jsxs("div", {
        className: "relative flex items-start justify-between gap-4",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "min-w-0",
          children: [/* @__PURE__ */ jsx("h3", {
            className: "font-display text-2xl md:text-3xl uppercase transition-colors duration-500 group-hover:bg-clip-text group-hover:text-transparent",
            style: {
              ["--gd"]: c.gradient,
              backgroundImage: "var(--gd)"
            },
            children: name
          }), description && /* @__PURE__ */ jsx("p", {
            className: "text-muted-foreground mt-2 line-clamp-2 max-w-md",
            children: description
          })]
        }), /* @__PURE__ */ jsx("div", {
          className: "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform",
          style: {
            background: c.gradient,
            boxShadow: c.glow
          },
          children: /* @__PURE__ */ jsx(ArrowRight, { className: "w-5 h-5 text-white" })
        })]
      }),
      /* @__PURE__ */ jsx("div", {
        className: "relative mt-5",
        children
      })
    ]
  });
}

export { HoverColorCard as H };
//# sourceMappingURL=hover-color-card-D9Bpm8P-.mjs.map
