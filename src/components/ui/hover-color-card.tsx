import { ReactNode, useState } from "react";
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
  const [transform, setTransform] = useState("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (window.matchMedia("(pointer: fine)").matches) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;
      setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
    }
  };

  const handleMouseLeave = () => {
    if (window.matchMedia("(pointer: fine)").matches) {
      setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
    }
  };

  return (
    <Link
      to="/events/$eventId"
      params={{ eventId }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform }}
      className="group relative block rounded-2xl border border-border/60 bg-card/60 backdrop-blur p-6 overflow-hidden transition-all duration-200 ease-out hover:border-transparent hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:z-10 h-full"
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: c.gradient, mixBlendMode: "overlay" }}
      />
      <div
        aria-hidden
        className="absolute -top-20 -right-20 w-56 h-56 rounded-full blur-3xl opacity-0 group-hover:opacity-80 transition duration-500 pointer-events-none"
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
