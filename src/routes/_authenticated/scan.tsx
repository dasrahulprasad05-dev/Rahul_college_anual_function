import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { ticketsService } from "@/services/firestore/tickets";
import { eventsService } from "@/services/firestore/events";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, ScanLine, RefreshCw, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/scan")({
  component: ScanPage,
});

type ScanResult =
  | { kind: "success"; ticket: { item: string; event: string; user_email: string } }
  | { kind: "already"; usedAt: string }
  | { kind: "invalid"; message: string };

function ScanPage() {
  const { user, isVolunteer, loading } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastTokenRef = useRef<string>("");

  async function handleToken(token: string) {
    if (token === lastTokenRef.current) return;
    lastTokenRef.current = token;

    try {
      const ticket = await ticketsService.checkInTicket(token, user?.id ?? "unknown");
      
      // Need to fetch event/item names for the success UI
      const ev = await eventsService.getEvent(ticket.event_id);
      
      setResult({ 
        kind: "success", 
        ticket: { 
          item: "Ticket Scanned", // Can't easily get item name without fetching item doc, keeping it simple
          event: ev?.name ?? "Event", 
          user_email: "" 
        } 
      });
    } catch (e: any) {
      const msg = e.message;
      if (msg === "Ticket already used") {
        setResult({ kind: "already", usedAt: new Date().toISOString() });
      } else {
        setResult({ kind: "invalid", message: msg });
      }
    }
  }

  async function start() {
    setError(null);
    setResult(null);
    lastTokenRef.current = "";
    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decoded) => { void handleToken(decoded); },
        () => {},
      );
      setScanning(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Camera unavailable");
    }
  }

  async function stop() {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch {}
      try { await scannerRef.current.clear(); } catch {}
      scannerRef.current = null;
    }
    setScanning(false);
  }

  useEffect(() => () => { void stop(); }, []);

  if (loading) return <div className="min-h-screen"><Navbar /></div>;
  if (!isVolunteer) {
    return (
      <div className="min-h-screen"><Navbar />
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto text-accent" />
          <h1 className="text-2xl font-bold mt-4">Volunteers only</h1>
          <p className="text-muted-foreground mt-2">You need volunteer or admin role to scan tickets. Ask an admin to grant access.</p>
          <Button asChild className="mt-6"><Link to="/">Go home</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-md mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ScanLine className="w-7 h-7 text-primary" />Scanner
        </h1>
        <p className="text-muted-foreground mt-1">Point camera at ticket QR.</p>

        <div className="mt-6 rounded-2xl border border-border/60 bg-card overflow-hidden">
          <div id="qr-reader" className="w-full aspect-square bg-black" />
          <div className="p-4">
            {!scanning ? (
              <Button onClick={start} className="w-full gradient-gold text-primary-foreground hover:opacity-90">
                <ScanLine className="w-4 h-4 mr-2" />Start scanning
              </Button>
            ) : (
              <Button onClick={stop} variant="outline" className="w-full">Stop</Button>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-destructive/10 border border-destructive/30 p-4 text-sm text-destructive-foreground">
            {error}
          </div>
        )}

        {result && (
          <div className={`mt-4 rounded-2xl p-5 border ${
            result.kind === "success" ? "bg-success/10 border-success/40" :
            result.kind === "already" ? "bg-accent/10 border-accent/40" :
            "bg-destructive/10 border-destructive/40"
          }`}>
            {result.kind === "success" && (
              <>
                <div className="flex items-center gap-2 text-success font-semibold"><CheckCircle2 className="w-5 h-5" />Checked in</div>
                <p className="mt-1 font-bold">{result.ticket.item}</p>
                <p className="text-xs text-muted-foreground">{result.ticket.event}</p>
              </>
            )}
            {result.kind === "already" && (
              <>
                <div className="flex items-center gap-2 text-accent font-semibold"><AlertTriangle className="w-5 h-5" />Already used</div>
                {result.usedAt && <p className="text-xs text-muted-foreground mt-1">at {new Date(result.usedAt).toLocaleString()}</p>}
              </>
            )}
            {result.kind === "invalid" && (
              <>
                <div className="flex items-center gap-2 text-destructive-foreground font-semibold"><XCircle className="w-5 h-5" />Invalid</div>
                <p className="text-xs text-muted-foreground mt-1">{result.message}</p>
              </>
            )}
            <Button variant="ghost" size="sm" onClick={() => { setResult(null); lastTokenRef.current = ""; }} className="mt-3">
              <RefreshCw className="w-3 h-3 mr-1" />Scan another
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
