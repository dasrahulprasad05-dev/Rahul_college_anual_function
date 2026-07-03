import { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { eventColors } from "@/lib/event-color";

interface HoverColorCardProps {
  eventId: string;
  name: string;
  description?: string;
  children?: ReactNode;
}

export function HoverColorCard({ eventId, name, description, children }: HoverColorCardProps) {
  const c = eventColors(eventId);

  return (
    <Link
      to="/events/$eventId"
      params={{ eventId }}
      className="group relative block rounded-2xl border border-border/60 bg-card/60 backdrop-blur p-6 overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:border-transparent hover:shadow-2xl h-full"
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: c.gradient, mixBlendMode: "overlay" }}
      />
      <div
        aria-hidden
        className="absolute -top-20 -right-20 w-56 h-56 rounded-full blur-3xl opacity-0 group-hover:opacity-80 transition duration-500"
        style={{
          background: `radial-gradient(circle, ${c.primary}, transparent 70%)`,
        }}
      />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3
            className="font-display text-2xl md:text-3xl uppercase transition-colors duration-500 group-hover:bg-clip-text group-hover:text-transparent"
            style={{ ["--gd" as string]: c.gradient, backgroundImage: "var(--gd)" }}
          >
            {name}
          </h3>
          {description && (
            <p className="text-muted-foreground mt-2 line-clamp-2 max-w-md">
              {description}
            </p>
          )}
        </div>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform"
          style={{ background: c.gradient, boxShadow: c.glow }}
        >
          <ArrowRight className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="relative mt-5">
        {children}
      </div>
    </Link>
  );
}
