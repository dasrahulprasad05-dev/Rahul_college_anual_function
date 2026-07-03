import { e as eventsService } from './events-CWfQmYOn.mjs';
import { B as Button } from './button-DRsC1qZi.mjs';
import { N as Navbar } from './Navbar-DzHODt_V.mjs';
import { e as eventColors } from './event-color-BBcoXhrs.mjs';
import { H as HoverColorCard } from './hover-color-card-D9Bpm8P-.mjs';
import { Link } from '@tanstack/react-router';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useQuery } from '@tanstack/react-query';
import { Ticket, ArrowRight, Sparkles, ScanLine, Zap, Calendar, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import './router-j_9pWM7h.mjs';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/app';
import 'firebase/storage';
import 'react';
import 'sonner';
import 'zod';
import '@radix-ui/react-slot';
import 'class-variance-authority';
import 'clsx';
import 'tailwind-merge';

var marqueeWords = [
  "DANCE",
  "DRAMA",
  "MUSIC",
  "AWARDS",
  "FASHION",
  "BATTLES",
  "AFTERPARTY"
];
function Index() {
  const { data: events, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      return (await eventsService.getEvents(true)).slice(0, 20);
    }
  });
  return /* @__PURE__ */ jsxs("div", {
    className: "min-h-screen overflow-x-hidden",
    children: [
      /* @__PURE__ */ jsx(Navbar, {}),
      /* @__PURE__ */ jsxs("section", {
        className: "relative",
        children: [
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 grid-bg opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" }),
          /* @__PURE__ */ jsx(motion.div, {
            "aria-hidden": true,
            className: "absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl",
            style: { background: "radial-gradient(circle, rgba(255,46,147,0.55), transparent 65%)" },
            animate: {
              x: [
                0,
                40,
                0
              ],
              y: [
                0,
                30,
                0
              ]
            },
            transition: {
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }),
          /* @__PURE__ */ jsx(motion.div, {
            "aria-hidden": true,
            className: "absolute top-40 -right-24 w-[28rem] h-[28rem] rounded-full blur-3xl",
            style: { background: "radial-gradient(circle, rgba(33,212,253,0.45), transparent 65%)" },
            animate: {
              x: [
                0,
                -50,
                0
              ],
              y: [
                0,
                40,
                0
              ]
            },
            transition: {
              duration: 14,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }),
          /* @__PURE__ */ jsxs("div", {
            className: "relative max-w-6xl mx-auto px-4 pt-16 pb-24",
            children: [
              /* @__PURE__ */ jsxs(motion.div, {
                initial: {
                  opacity: 0,
                  y: 8
                },
                animate: {
                  opacity: 1,
                  y: 0
                },
                transition: { duration: 0.5 },
                className: "inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/40 bg-primary/10 text-sm mb-8",
                children: [/* @__PURE__ */ jsx("span", { className: "inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" }), /* @__PURE__ */ jsx("span", {
                  className: "text-foreground/80 tracking-wide",
                  children: "LIVE \xB7 ANNUAL FUNCTION 2026"
                })]
              }),
              /* @__PURE__ */ jsx("h1", {
                className: "font-display text-[14vw] md:text-[8.5rem] leading-[0.85] tracking-tighter uppercase",
                children: "FESTA".split("").map((c, i) => /* @__PURE__ */ jsx(motion.span, {
                  initial: {
                    y: 80,
                    opacity: 0,
                    rotateX: -60
                  },
                  animate: {
                    y: 0,
                    opacity: 1,
                    rotateX: 0
                  },
                  transition: {
                    delay: 0.05 * i,
                    duration: 0.7,
                    ease: [
                      0.16,
                      1,
                      0.3,
                      1
                    ]
                  },
                  className: "inline-block",
                  children: /* @__PURE__ */ jsx("span", {
                    className: i % 2 === 0 ? "text-foreground" : "text-gradient-neon",
                    children: c
                  })
                }, i))
              }),
              /* @__PURE__ */ jsxs("div", {
                className: "mt-4 flex flex-wrap items-end justify-between gap-6",
                children: [/* @__PURE__ */ jsx(motion.p, {
                  initial: {
                    opacity: 0,
                    y: 10
                  },
                  animate: {
                    opacity: 1,
                    y: 0
                  },
                  transition: {
                    delay: 0.5,
                    duration: 0.6
                  },
                  className: "max-w-md text-base md:text-lg text-muted-foreground",
                  children: "Three nights. One stage. QR tickets for every show \u2014 book it, scan it, scream it."
                }), /* @__PURE__ */ jsxs(motion.div, {
                  initial: {
                    opacity: 0,
                    y: 10
                  },
                  animate: {
                    opacity: 1,
                    y: 0
                  },
                  transition: {
                    delay: 0.65,
                    duration: 0.6
                  },
                  className: "flex gap-3",
                  children: [/* @__PURE__ */ jsx(Button, {
                    size: "lg",
                    className: "gradient-gold text-primary-foreground hover:opacity-90 group",
                    asChild: true,
                    children: /* @__PURE__ */ jsxs(Link, {
                      to: "/events",
                      children: [
                        /* @__PURE__ */ jsx(Ticket, { className: "w-4 h-4 mr-2" }),
                        "Browse events",
                        /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4 ml-2 group-hover:translate-x-1 transition" })
                      ]
                    })
                  }), /* @__PURE__ */ jsx(Button, {
                    size: "lg",
                    variant: "outline",
                    className: "border-accent/50 hover:border-accent",
                    asChild: true,
                    children: /* @__PURE__ */ jsx(Link, {
                      to: "/tickets",
                      children: "My tickets"
                    })
                  })]
                })]
              })
            ]
          }),
          /* @__PURE__ */ jsx(motion.div, {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            transition: {
              delay: 0.9,
              duration: 0.8
            },
            className: "relative border-y border-border/50 bg-background/40 backdrop-blur py-5 overflow-hidden",
            children: /* @__PURE__ */ jsx("div", {
              className: "flex whitespace-nowrap animate-marquee w-max",
              children: [
                ...marqueeWords,
                ...marqueeWords,
                ...marqueeWords
              ].map((w, i) => /* @__PURE__ */ jsxs("span", {
                className: "font-display text-3xl md:text-5xl uppercase mx-8 flex items-center gap-8",
                children: [/* @__PURE__ */ jsx("span", {
                  className: i % 3 === 0 ? "text-gradient-neon" : i % 3 === 1 ? "text-foreground" : "text-accent",
                  children: w
                }), /* @__PURE__ */ jsx(Sparkles, { className: "w-6 h-6 text-primary shrink-0" })]
              }, i))
            })
          })
        ]
      }),
      /* @__PURE__ */ jsx("section", {
        className: "max-w-6xl mx-auto px-4 py-20",
        children: /* @__PURE__ */ jsx("div", {
          className: "grid grid-cols-1 md:grid-cols-3 gap-4",
          children: [
            {
              icon: Ticket,
              title: "QR Tickets",
              desc: "Unique QR per ticket. Delivered instantly to your account.",
              color: "var(--neon-pink)"
            },
            {
              icon: ScanLine,
              title: "Scan & enter",
              desc: "Volunteers scan at the gate \u2014 no paper, no lines, no fakes.",
              color: "var(--neon-cyan)"
            },
            {
              icon: Zap,
              title: "Item-level access",
              desc: "Pick exactly the shows you want \u2014 every item booked separately.",
              color: "var(--neon-yellow)"
            }
          ].map((f, i) => /* @__PURE__ */ jsxs(motion.div, {
            initial: {
              opacity: 0,
              y: 30
            },
            whileInView: {
              opacity: 1,
              y: 0
            },
            viewport: {
              once: true,
              margin: "-50px"
            },
            transition: {
              delay: i * 0.1,
              duration: 0.6
            },
            whileHover: { y: -4 },
            className: "group relative rounded-2xl border border-border/60 bg-card/40 backdrop-blur p-6 overflow-hidden",
            children: [
              /* @__PURE__ */ jsx("div", {
                "aria-hidden": true,
                className: "absolute -top-16 -right-16 w-40 h-40 rounded-full blur-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-500",
                style: { background: `radial-gradient(circle, ${f.color}, transparent 70%)` }
              }),
              /* @__PURE__ */ jsx("div", {
                className: "w-11 h-11 rounded-xl flex items-center justify-center mb-4",
                style: {
                  background: `color-mix(in oklab, ${f.color} 18%, transparent)`,
                  color: f.color
                },
                children: /* @__PURE__ */ jsx(f.icon, { className: "w-5 h-5" })
              }),
              /* @__PURE__ */ jsx("h3", {
                className: "font-display text-lg uppercase tracking-tight",
                children: f.title
              }),
              /* @__PURE__ */ jsx("p", {
                className: "text-sm text-muted-foreground mt-2",
                children: f.desc
              })
            ]
          }, f.title))
        })
      }),
      /* @__PURE__ */ jsxs("section", {
        id: "events",
        className: "max-w-6xl mx-auto px-4 py-16",
        children: [/* @__PURE__ */ jsx(motion.div, {
          initial: {
            opacity: 0,
            y: 20
          },
          whileInView: {
            opacity: 1,
            y: 0
          },
          viewport: { once: true },
          transition: { duration: 0.5 },
          className: "flex items-end justify-between mb-10",
          children: /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
            className: "text-xs tracking-[0.3em] text-accent uppercase",
            children: "\u2014 Line-up"
          }), /* @__PURE__ */ jsxs("h2", {
            className: "font-display text-5xl md:text-6xl mt-2 uppercase",
            children: ["Upcoming ", /* @__PURE__ */ jsx("span", {
              className: "text-gradient-neon",
              children: "events"
            })]
          })] })
        }), isLoading ? /* @__PURE__ */ jsx("div", {
          className: "grid grid-cols-1 md:grid-cols-2 gap-4",
          children: [1, 2].map((i) => /* @__PURE__ */ jsx("div", { className: "h-56 rounded-2xl bg-card/40 animate-pulse" }, i))
        }) : !(events == null ? void 0 : events.length) ? /* @__PURE__ */ jsx("div", {
          className: "rounded-2xl border border-dashed border-border p-12 text-center",
          children: /* @__PURE__ */ jsx("p", {
            className: "text-muted-foreground",
            children: "No events published yet. Admins can create events from the Admin panel."
          })
        }) : /* @__PURE__ */ jsx("div", {
          className: "grid grid-cols-1 md:grid-cols-2 gap-4",
          children: events.map((e, i) => {
            const c = eventColors(e.id);
            return /* @__PURE__ */ jsx(motion.div, {
              initial: {
                opacity: 0,
                y: 30
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
                delay: i * 0.08,
                duration: 0.55
              },
              children: /* @__PURE__ */ jsx(HoverColorCard, {
                eventId: e.id,
                name: e.name,
                description: e.description,
                children: /* @__PURE__ */ jsxs("div", {
                  className: "relative flex items-center gap-4 mt-5 text-sm text-muted-foreground",
                  children: [e.event_date && /* @__PURE__ */ jsxs("span", {
                    className: "flex items-center gap-1.5",
                    children: [/* @__PURE__ */ jsx(Calendar, {
                      className: "w-4 h-4 transition-colors",
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
      }),
      /* @__PURE__ */ jsx("footer", {
        className: "border-t border-border/50 mt-16",
        children: /* @__PURE__ */ jsx("div", {
          className: "max-w-6xl mx-auto px-4 py-8 text-sm text-muted-foreground text-center",
          children: "Festa \xB7 Built for college fests"
        })
      })
    ]
  });
}

export { Index as component };
//# sourceMappingURL=routes-BLYotEsL.mjs.map
