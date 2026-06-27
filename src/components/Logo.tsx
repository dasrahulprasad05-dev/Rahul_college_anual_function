import { motion } from "framer-motion";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="relative inline-flex">
        <motion.svg
          width="26"
          height="26"
          viewBox="0 0 26 26"
          className="drop-shadow-[0_0_10px_rgba(255,46,147,0.6)]"
          initial={{ rotate: -20, scale: 0.6, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <defs>
            <linearGradient id="lg-spark" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#FF2E93" />
              <stop offset="50%" stopColor="#FFE53B" />
              <stop offset="100%" stopColor="#21D4FD" />
            </linearGradient>
          </defs>
          <path
            d="M13 1.5 L15.2 9.8 L23.5 11.8 L15.5 14.6 L13.6 23.5 L11.2 14.8 L2.5 13.2 L10.7 10.2 Z"
            fill="url(#lg-spark)"
          />
        </motion.svg>
        <motion.span
          aria-hidden
          className="absolute -inset-2 rounded-full bg-[radial-gradient(circle,rgba(255,46,147,0.55),transparent_70%)] -z-10"
          animate={{ opacity: [0.4, 0.9, 0.4], scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        />
      </span>
      <span className="font-display text-xl tracking-tight uppercase">
        <span className="text-foreground">fes</span>
        <span className="text-gradient-neon">ta</span>
      </span>
    </span>
  );
}
