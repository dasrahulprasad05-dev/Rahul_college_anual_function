import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { auth, db } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

const searchSchema = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Sign in — Festa" }] }),
  component: AuthPage,
});

const rules = [
  { id: "length", label: "At least 6 characters", test: (p: string) => p.length >= 6 },
  { id: "upper", label: "One uppercase letter (A-Z)", test: (p: string) => /[A-Z]/.test(p) },
  { id: "special", label: "One special character (!@#$...)", test: (p: string) => /[^a-zA-Z0-9]/.test(p) },
];

function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;
  const passed = rules.filter((r) => r.test(password)).length;
  const strength = passed === 0 ? 0 : passed === 1 ? 33 : passed === 2 ? 66 : 100;
  const color = strength <= 33 ? "var(--neon-pink)" : strength <= 66 ? "var(--neon-yellow)" : "var(--neon-cyan)";
  const label = strength <= 33 ? "Weak" : strength <= 66 ? "Medium" : "Strong";

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-4 space-y-3 overflow-hidden"
    >
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${strength}%`, backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
          />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color }}>{label}</span>
      </div>

      <div className="space-y-1.5 bg-white/5 rounded-lg p-3 border border-white/5">
        {rules.map((rule) => {
          const ok = rule.test(password);
          return (
            <div key={rule.id} className="flex items-center gap-2">
              {ok ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--neon-cyan)] shrink-0" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              )}
              <span className={`text-xs ${ok ? "text-[var(--neon-cyan)]" : "text-muted-foreground"}`}>
                {rule.label}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function FloatingInput({ id, label, type = "text", ...props }: any) {
  return (
    <div className="relative">
      <Input
        id={id}
        type={type}
        placeholder=" "
        {...props}
        className={`peer pt-6 pb-2 h-14 bg-background/50 backdrop-blur-md border-white/10 focus-visible:border-primary/50 focus-visible:ring-primary/20 transition-all ${props.className || ""}`}
      />
      <label
        htmlFor={id}
        className="absolute left-3.5 top-4 text-muted-foreground transition-all duration-200 pointer-events-none text-base
                   peer-focus:-translate-y-2.5 peer-focus:text-[11px] peer-focus:text-primary peer-focus:font-medium
                   peer-[&:not(:placeholder-shown)]:-translate-y-2.5 peer-[&:not(:placeholder-shown)]:-translate-x-0 peer-[&:not(:placeholder-shown)]:text-[11px] peer-[&:not(:placeholder-shown)]:font-medium"
      >
        {label}
      </label>
    </div>
  );
}

function AuthPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/auth" });
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: redirect ?? "/tickets" });
  }, [user, loading, navigate, redirect]);

  const isPasswordValid = mode === "signup" ? rules.every((r) => r.test(password)) : true;

  const triggerConfetti = () => {
    const end = Date.now() + 1.5 * 1000;
    const colors = ['#FF3D8A', '#21D4FD', '#F5B301'];
    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    }());
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "signup" && !isPasswordValid) {
      toast.error("Please meet all password requirements first.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: name });
        await setDoc(doc(db, "users", cred.user.uid), {
          full_name: name,
          email: email,
          role: "student",
          created_at: new Date().toISOString(),
        });
        triggerConfetti();
        toast.success("Account created successfully!");
        setTimeout(() => setMode("signin"), 1500); // give time for confetti
      } else if (mode === "forgot") {
        await sendPasswordResetEmail(auth, email);
        toast.success("If that email exists, a reset link is on the way.");
        setMode("signin");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Welcome back!");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      await setDoc(
        doc(db, "users", cred.user.uid),
        {
          full_name: cred.user.displayName,
          email: cred.user.email,
          role: "student",
          created_at: new Date().toISOString(),
        },
        { merge: true },
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
    }
  }

  return (
    <div className="min-h-screen flex lg:grid lg:grid-cols-2 relative bg-background">
      {/* Left side: Graphic/Gradient for Desktop */}
      <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden bg-black">
        {/* Complex Animated Background Gradient */}
        <div className="absolute inset-0 grid-bg opacity-30" />
        <motion.div
          className="absolute -top-[20%] -left-[20%] w-[70%] h-[70%] rounded-full blur-[120px] mix-blend-screen pointer-events-none"
          style={{ background: "radial-gradient(circle, var(--neon-pink), transparent 70%)" }}
          animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-[20%] -right-[20%] w-[70%] h-[70%] rounded-full blur-[120px] mix-blend-screen pointer-events-none"
          style={{ background: "radial-gradient(circle, var(--neon-cyan), transparent 70%)" }}
          animate={{ x: [0, -40, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-[40%] right-[10%] w-[40%] h-[40%] rounded-full blur-[100px] mix-blend-screen pointer-events-none"
          style={{ background: "radial-gradient(circle, var(--neon-yellow), transparent 70%)" }}
          animate={{ x: [0, 20, 0], y: [0, 40, 0], scale: [1, 0.9, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl gradient-gold flex items-center justify-center shadow-xl shadow-primary/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display text-3xl font-bold tracking-tight text-white">Festa</span>
          </Link>
        </div>

        <div className="relative z-10">
          <blockquote className="space-y-4 max-w-lg">
            <p className="text-4xl font-display uppercase leading-tight text-white">
              "The best college fest experience, from entry to exit."
            </p>
            <footer className="text-sm text-white/70 tracking-widest uppercase">
              – Student Council 2026
            </footer>
          </blockquote>
        </div>
      </div>

      {/* Right side: Auth Form */}
      <div className="w-full flex items-center justify-center p-6 md:p-12 relative">
        {/* Mobile blobs (since left side is hidden on mobile) */}
        <div className="lg:hidden absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[40%] rounded-full blur-[80px] opacity-40 bg-[var(--neon-pink)]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[40%] rounded-full blur-[80px] opacity-40 bg-[var(--neon-cyan)]" />
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md relative z-10"
        >
          {/* Mobile Logo */}
          <Link to="/" className="lg:hidden flex items-center justify-center gap-2 mb-10">
            <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl font-bold tracking-tight">Festa</span>
          </Link>

          <div className="rounded-3xl border border-white/10 bg-background/60 backdrop-blur-2xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 gradient-gold opacity-50" />
            
            <h1 className="font-display text-3xl uppercase tracking-tight">
              {mode === "signin" ? "Welcome back" : mode === "signup" ? "Join the party" : "Reset password"}
            </h1>
            <p className="text-sm text-muted-foreground mt-2 mb-8">
              {mode === "signin"
                ? "Sign in to book and view your tickets."
                : mode === "signup"
                  ? "Sign up to start booking tickets."
                  : "Enter your email and we'll send you a reset link."}
            </p>

            {mode !== "forgot" && (
              <>
                <Button onClick={google} variant="outline" className="w-full h-12 bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 transition-all">
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M21.35 11.1H12v3.2h5.35c-.23 1.47-1.7 4.3-5.35 4.3-3.22 0-5.85-2.66-5.85-5.95s2.63-5.95 5.85-5.95c1.83 0 3.06.78 3.76 1.45l2.56-2.47C16.85 3.97 14.65 3 12 3 6.97 3 3 6.97 3 12s3.97 9 9 9c5.2 0 8.65-3.66 8.65-8.8 0-.6-.07-1.04-.3-1.1z" />
                  </svg>
                  Continue with Google
                </Button>
                <div className="flex items-center gap-4 my-6">
                  <div className="h-px flex-1 bg-border/50" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Or</span>
                  <div className="h-px flex-1 bg-border/50" />
                </div>
              </>
            )}

            <form onSubmit={submit} className="space-y-4">
              {mode === "signup" && (
                <FloatingInput
                  id="name"
                  label="Full Name"
                  value={name}
                  onChange={(e: any) => setName(e.target.value)}
                  required
                />
              )}

              <FloatingInput
                id="email"
                type="email"
                label="Email Address"
                value={email}
                onChange={(e: any) => setEmail(e.target.value)}
                required
              />

              {mode !== "forgot" && (
                <div>
                  <div className="relative mt-4">
                    <FloatingInput
                      id="password"
                      type={showPassword ? "text" : "password"}
                      label={mode === "signup" ? "Create Password" : "Password"}
                      value={password}
                      onChange={(e: any) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="pr-12"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  {mode === "signin" && (
                    <div className="flex justify-end mt-3">
                      <button
                        type="button"
                        onClick={() => setMode("forgot")}
                        className="text-xs text-primary hover:text-primary/80 transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  {/* Password strength — only on signup */}
                  <AnimatePresence>
                    {mode === "signup" && password.length > 0 && (
                      <PasswordStrengthMeter password={password} />
                    )}
                  </AnimatePresence>
                </div>
              )}

              <Button
                type="submit"
                disabled={busy || (mode === "signup" && !isPasswordValid)}
                className="w-full gradient-gold text-primary-foreground h-12 font-semibold mt-6 text-base tracking-wide"
              >
                {busy ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Please wait...
                  </span>
                ) : mode === "signin" ? "Sign In"
                  : mode === "signup" ? "Create Account"
                    : "Send Reset Link"}
              </Button>
            </form>

            <p className="text-sm text-center text-muted-foreground mt-8">
              {mode === "forgot" ? (
                <button onClick={() => setMode("signin")} className="text-primary hover:text-primary/80 font-medium transition-colors">
                  Back to sign in
                </button>
              ) : (
                <>
                  {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
                  <button
                    onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setPassword(""); }}
                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    {mode === "signin" ? "Create an account" : "Sign in"}
                  </button>
                </>
              )}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
