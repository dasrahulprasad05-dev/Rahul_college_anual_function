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
import { Label } from "@/components/ui/label";
import { Sparkles, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";

const searchSchema = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Sign in — Festa" }] }),
  component: AuthPage,
});

// Password strength rules
const rules = [
  { id: "length", label: "At least 6 characters", test: (p: string) => p.length >= 6 },
  { id: "upper", label: "One uppercase letter (A-Z)", test: (p: string) => /[A-Z]/.test(p) },
  { id: "special", label: "One special character (!@#$...)", test: (p: string) => /[^a-zA-Z0-9]/.test(p) },
];

function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;
  const passed = rules.filter((r) => r.test(password)).length;
  const strength = passed === 0 ? 0 : passed === 1 ? 33 : passed === 2 ? 66 : 100;
  const color = strength <= 33 ? "#ef4444" : strength <= 66 ? "#f59e0b" : "#22c55e";
  const label = strength <= 33 ? "Weak" : strength <= 66 ? "Medium" : "Strong";

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 space-y-2"
    >
      {/* Strength bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${strength}%`, backgroundColor: color }}
          />
        </div>
        <span className="text-xs font-medium" style={{ color }}>{label}</span>
      </div>

      {/* Rules checklist */}
      <div className="space-y-1">
        {rules.map((rule) => {
          const ok = rule.test(password);
          return (
            <div key={rule.id} className="flex items-center gap-2">
              {ok ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              )}
              <span className={`text-xs ${ok ? "text-green-500" : "text-muted-foreground"}`}>
                {rule.label}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
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

  const isPasswordValid = mode === "signup"
    ? rules.every((r) => r.test(password))
    : true;

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
        toast.success("Account created successfully!");
        setMode("signin");
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
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background blobs */}
      <motion.div
        aria-hidden
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(255,46,147,0.25), transparent 65%)" }}
        animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(33,212,253,0.2), transparent 65%)" }}
        animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="w-full max-w-md relative z-10">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-2xl font-bold tracking-tight">Festa</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur-xl p-8 shadow-2xl"
        >
          <h1 className="text-2xl font-bold">
            {mode === "signin" ? "Welcome back" : mode === "signup" ? "Create account" : "Reset password"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 mb-6">
            {mode === "signin"
              ? "Sign in to book and view your tickets."
              : mode === "signup"
                ? "Sign up to start booking tickets."
                : "Enter your email and we'll send you a reset link."}
          </p>

          {mode !== "forgot" && (
            <>
              <Button onClick={google} variant="outline" className="w-full">
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M21.35 11.1H12v3.2h5.35c-.23 1.47-1.7 4.3-5.35 4.3-3.22 0-5.85-2.66-5.85-5.95s2.63-5.95 5.85-5.95c1.83 0 3.06.78 3.76 1.45l2.56-2.47C16.85 3.97 14.65 3 12 3 6.97 3 3 6.97 3 12s3.97 9 9 9c5.2 0 8.65-3.66 8.65-8.8 0-.6-.07-1.04-.3-1.1z" />
                </svg>
                Continue with Google
              </Button>
              <div className="flex items-center gap-3 my-5">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">OR</span>
                <div className="h-px flex-1 bg-border" />
              </div>
            </>
          )}

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Your full name"
                  className="mt-1.5"
                />
              </div>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="mt-1.5"
              />
            </div>

            {mode !== "forgot" && (
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {mode === "signin" && (
                    <button
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative mt-1.5">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder={mode === "signup" ? "Create a strong password" : "Your password"}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password strength — only on signup */}
                <AnimatePresence>
                  {mode === "signup" && <PasswordStrengthMeter password={password} />}
                </AnimatePresence>
              </div>
            )}

            <Button
              type="submit"
              disabled={busy || (mode === "signup" && !isPasswordValid)}
              className="w-full gradient-gold text-primary-foreground hover:opacity-90 h-11 font-semibold mt-2"
            >
              {busy ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Please wait...
                </span>
              ) : mode === "signin" ? "Sign in"
                : mode === "signup" ? "Create account"
                  : "Send reset link"}
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground mt-5">
            {mode === "forgot" ? (
              <button onClick={() => setMode("signin")} className="text-primary hover:underline">
                Back to sign in
              </button>
            ) : (
              <>
                {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
                <button
                  onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setPassword(""); }}
                  className="text-primary hover:underline"
                >
                  {mode === "signin" ? "Create an account" : "Sign in"}
                </button>
              </>
            )}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
