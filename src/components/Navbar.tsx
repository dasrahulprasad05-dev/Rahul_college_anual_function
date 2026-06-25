import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Sparkles, Ticket, ScanLine, Shield, LogOut } from "lucide-react";

export function Navbar() {
  const { user, isAdmin, isVolunteer, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg gradient-gold flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">Festa</span>
        </Link>

        <nav className="flex items-center gap-1">
          {user && (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/tickets"><Ticket className="w-4 h-4 mr-1.5" />My Tickets</Link>
              </Button>
              {isVolunteer && (
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/scan"><ScanLine className="w-4 h-4 mr-1.5" />Scan</Link>
                </Button>
              )}
              {isAdmin && (
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/admin"><Shield className="w-4 h-4 mr-1.5" />Admin</Link>
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={async () => { await signOut(); navigate({ to: "/" }); }}>
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          )}
          {!user && (
            <Button size="sm" className="gradient-gold text-primary-foreground hover:opacity-90" asChild>
              <Link to="/auth">Sign in</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
