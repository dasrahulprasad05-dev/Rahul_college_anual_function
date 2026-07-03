import { u as useAuth } from './router-j_9pWM7h.mjs';
import { B as Button } from './button-DRsC1qZi.mjs';
import { useNavigate, Link } from '@tanstack/react-router';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { Ticket, Users, ScanLine, BarChart3, Shield, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

function Logo({ className = "" }) {
  return /* @__PURE__ */ jsxs("span", {
    className: `inline-flex items-center gap-2 ${className}`,
    children: [/* @__PURE__ */ jsxs("span", {
      className: "relative inline-flex",
      children: [/* @__PURE__ */ jsxs(motion.svg, {
        width: "26",
        height: "26",
        viewBox: "0 0 26 26",
        className: "drop-shadow-[0_0_10px_rgba(255,46,147,0.6)]",
        initial: {
          rotate: -20,
          scale: 0.6,
          opacity: 0
        },
        animate: {
          rotate: 0,
          scale: 1,
          opacity: 1
        },
        transition: {
          duration: 0.7,
          ease: "easeOut"
        },
        children: [/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", {
          id: "lg-spark",
          x1: "0",
          x2: "1",
          y1: "0",
          y2: "1",
          children: [
            /* @__PURE__ */ jsx("stop", {
              offset: "0%",
              stopColor: "#FF2E93"
            }),
            /* @__PURE__ */ jsx("stop", {
              offset: "50%",
              stopColor: "#FFE53B"
            }),
            /* @__PURE__ */ jsx("stop", {
              offset: "100%",
              stopColor: "#21D4FD"
            })
          ]
        }) }), /* @__PURE__ */ jsx("path", {
          d: "M13 1.5 L15.2 9.8 L23.5 11.8 L15.5 14.6 L13.6 23.5 L11.2 14.8 L2.5 13.2 L10.7 10.2 Z",
          fill: "url(#lg-spark)"
        })]
      }), /* @__PURE__ */ jsx(motion.span, {
        "aria-hidden": true,
        className: "absolute -inset-2 rounded-full bg-[radial-gradient(circle,rgba(255,46,147,0.55),transparent_70%)] -z-10",
        animate: {
          opacity: [
            0.4,
            0.9,
            0.4
          ],
          scale: [
            0.9,
            1.1,
            0.9
          ]
        },
        transition: {
          duration: 3.4,
          repeat: Infinity,
          ease: "easeInOut"
        }
      })]
    }), /* @__PURE__ */ jsxs("span", {
      className: "font-display text-xl tracking-tight uppercase",
      children: [/* @__PURE__ */ jsx("span", {
        className: "text-foreground",
        children: "fes"
      }), /* @__PURE__ */ jsx("span", {
        className: "text-gradient-neon",
        children: "ta"
      })]
    })]
  });
}
function Navbar() {
  const { user, isAdmin, isVolunteer, signOut } = useAuth();
  const navigate = useNavigate();
  return /* @__PURE__ */ jsx("header", {
    className: "sticky top-0 z-50 backdrop-blur-xl bg-background/60 border-b border-border/40",
    children: /* @__PURE__ */ jsxs("div", {
      className: "max-w-6xl mx-auto px-4 h-16 flex items-center justify-between",
      children: [/* @__PURE__ */ jsx(Link, {
        to: "/",
        className: "group",
        children: /* @__PURE__ */ jsx(Logo, { className: "group-hover:scale-[1.03] transition" })
      }), /* @__PURE__ */ jsxs("nav", {
        className: "flex items-center gap-1",
        children: [user && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Button, {
            variant: "ghost",
            size: "sm",
            asChild: true,
            children: /* @__PURE__ */ jsxs(Link, {
              to: "/tickets",
              children: [/* @__PURE__ */ jsx(Ticket, { className: "w-4 h-4 mr-1.5" }), "My Tickets"]
            })
          }),
          isVolunteer && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Button, {
            variant: "ghost",
            size: "sm",
            asChild: true,
            children: /* @__PURE__ */ jsxs(Link, {
              to: "/volunteer",
              children: [/* @__PURE__ */ jsx(Users, { className: "w-4 h-4 mr-1.5" }), "Volunteer"]
            })
          }), /* @__PURE__ */ jsx(Button, {
            variant: "ghost",
            size: "sm",
            asChild: true,
            children: /* @__PURE__ */ jsxs(Link, {
              to: "/scan",
              children: [/* @__PURE__ */ jsx(ScanLine, { className: "w-4 h-4 mr-1.5" }), "Scan"]
            })
          })] }),
          isAdmin && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Button, {
            variant: "ghost",
            size: "sm",
            asChild: true,
            children: /* @__PURE__ */ jsxs(Link, {
              to: "/dashboard",
              children: [/* @__PURE__ */ jsx(BarChart3, { className: "w-4 h-4 mr-1.5" }), "Dashboard"]
            })
          }), /* @__PURE__ */ jsx(Button, {
            variant: "ghost",
            size: "sm",
            asChild: true,
            children: /* @__PURE__ */ jsxs(Link, {
              to: "/admin",
              children: [/* @__PURE__ */ jsx(Shield, { className: "w-4 h-4 mr-1.5" }), "Admin"]
            })
          })] }),
          /* @__PURE__ */ jsx(Button, {
            variant: "ghost",
            size: "sm",
            onClick: async () => {
              await signOut();
              navigate({ to: "/" });
            },
            children: /* @__PURE__ */ jsx(LogOut, { className: "w-4 h-4" })
          })
        ] }), !user && /* @__PURE__ */ jsx(Button, {
          size: "sm",
          className: "gradient-gold text-primary-foreground hover:opacity-90",
          asChild: true,
          children: /* @__PURE__ */ jsx(Link, {
            to: "/auth",
            children: "Sign in"
          })
        })]
      })]
    })
  });
}

export { Navbar as N };
//# sourceMappingURL=Navbar-DzHODt_V.mjs.map
