import { u as useAuth } from './router-j_9pWM7h.mjs';
import { e as eventsService } from './events-CWfQmYOn.mjs';
import { B as Button } from './button-DRsC1qZi.mjs';
import { N as Navbar } from './Navbar-DzHODt_V.mjs';
import { t as ticketsService } from './tickets-DBrl0I-g.mjs';
import { useState, useRef, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { AlertTriangle, ScanLine, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/app';
import 'firebase/storage';
import '@tanstack/react-query';
import 'sonner';
import 'zod';
import '@radix-ui/react-slot';
import 'class-variance-authority';
import 'clsx';
import 'tailwind-merge';
import 'framer-motion';

function ScanPage() {
  const { user, isVolunteer, loading } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);
  const lastTokenRef = useRef("");
  async function handleToken(token) {
    var _a, _b, _c;
    if (token === lastTokenRef.current) return;
    lastTokenRef.current = token;
    try {
      const ticket = await ticketsService.checkInTicket(token, (_a = user == null ? void 0 : user.id) != null ? _a : "unknown");
      setResult({
        kind: "success",
        ticket: {
          item: "Ticket Scanned",
          event: (_c = (_b = await eventsService.getEvent(ticket.event_id)) == null ? void 0 : _b.name) != null ? _c : "Event",
          user_email: ""
        }
      });
    } catch (e) {
      const msg = e.message;
      if (msg === "Ticket already used") setResult({
        kind: "already",
        usedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      else setResult({
        kind: "invalid",
        message: msg
      });
    }
  }
  async function start() {
    setError(null);
    setResult(null);
    lastTokenRef.current = "";
    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;
      await scanner.start({ facingMode: "environment" }, {
        fps: 10,
        qrbox: {
          width: 250,
          height: 250
        }
      }, (decoded) => {
        handleToken(decoded);
      }, () => {
      });
      setScanning(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Camera unavailable");
    }
  }
  async function stop() {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch {
      }
      try {
        await scannerRef.current.clear();
      } catch {
      }
      scannerRef.current = null;
    }
    setScanning(false);
  }
  useEffect(() => () => {
    stop();
  }, []);
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
          children: "You need volunteer or admin role to scan tickets. Ask an admin to grant access."
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
      className: "max-w-md mx-auto px-4 py-8",
      children: [
        /* @__PURE__ */ jsxs("h1", {
          className: "text-3xl font-bold flex items-center gap-2",
          children: [/* @__PURE__ */ jsx(ScanLine, { className: "w-7 h-7 text-primary" }), "Scanner"]
        }),
        /* @__PURE__ */ jsx("p", {
          className: "text-muted-foreground mt-1",
          children: "Point camera at ticket QR."
        }),
        /* @__PURE__ */ jsxs("div", {
          className: "mt-6 rounded-2xl border border-border/60 bg-card overflow-hidden",
          children: [/* @__PURE__ */ jsx("div", {
            id: "qr-reader",
            className: "w-full aspect-square bg-black"
          }), /* @__PURE__ */ jsx("div", {
            className: "p-4",
            children: !scanning ? /* @__PURE__ */ jsxs(Button, {
              onClick: start,
              className: "w-full gradient-gold text-primary-foreground hover:opacity-90",
              children: [/* @__PURE__ */ jsx(ScanLine, { className: "w-4 h-4 mr-2" }), "Start scanning"]
            }) : /* @__PURE__ */ jsx(Button, {
              onClick: stop,
              variant: "outline",
              className: "w-full",
              children: "Stop"
            })
          })]
        }),
        error && /* @__PURE__ */ jsx("div", {
          className: "mt-4 rounded-xl bg-destructive/10 border border-destructive/30 p-4 text-sm text-destructive-foreground",
          children: error
        }),
        result && /* @__PURE__ */ jsxs("div", {
          className: `mt-4 rounded-2xl p-5 border ${result.kind === "success" ? "bg-success/10 border-success/40" : result.kind === "already" ? "bg-accent/10 border-accent/40" : "bg-destructive/10 border-destructive/40"}`,
          children: [
            result.kind === "success" && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsxs("div", {
                className: "flex items-center gap-2 text-success font-semibold",
                children: [/* @__PURE__ */ jsx(CheckCircle2, { className: "w-5 h-5" }), "Checked in"]
              }),
              /* @__PURE__ */ jsx("p", {
                className: "mt-1 font-bold",
                children: result.ticket.item
              }),
              /* @__PURE__ */ jsx("p", {
                className: "text-xs text-muted-foreground",
                children: result.ticket.event
              })
            ] }),
            result.kind === "already" && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("div", {
              className: "flex items-center gap-2 text-accent font-semibold",
              children: [/* @__PURE__ */ jsx(AlertTriangle, { className: "w-5 h-5" }), "Already used"]
            }), result.usedAt && /* @__PURE__ */ jsxs("p", {
              className: "text-xs text-muted-foreground mt-1",
              children: ["at ", new Date(result.usedAt).toLocaleString()]
            })] }),
            result.kind === "invalid" && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("div", {
              className: "flex items-center gap-2 text-destructive-foreground font-semibold",
              children: [/* @__PURE__ */ jsx(XCircle, { className: "w-5 h-5" }), "Invalid"]
            }), /* @__PURE__ */ jsx("p", {
              className: "text-xs text-muted-foreground mt-1",
              children: result.message
            })] }),
            /* @__PURE__ */ jsxs(Button, {
              variant: "ghost",
              size: "sm",
              onClick: () => {
                setResult(null);
                lastTokenRef.current = "";
              },
              className: "mt-3",
              children: [/* @__PURE__ */ jsx(RefreshCw, { className: "w-3 h-3 mr-1" }), "Scan another"]
            })
          ]
        })
      ]
    })]
  });
}

export { ScanPage as component };
//# sourceMappingURL=scan-DF45i0x_.mjs.map
