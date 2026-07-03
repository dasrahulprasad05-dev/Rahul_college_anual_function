import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Eye, EyeOff, ShieldCheck, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({ meta: [{ title: "Reset Password — Festa" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [oobCode, setOobCode] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("oobCode");
    if (code) {
      verifyPasswordResetCode(auth, code)
        .then(() => {
          setOobCode(code);
          setReady(true);
        })
        .catch(() => {
          toast.error("Invalid or expired reset link. Please request a new one.");
        });
    } else {
      toast.error("Missing reset code.");
    }
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords don't match");
      return;
    }
    if (!oobCode) return;
    setBusy(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setDone(true);
      toast.success("Password updated successfully!");
      setTimeout(() => navigate({ to: "/auth" }), 2500);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setBusy(false);
    }
  }

  const passwordsMatch = confirm.length > 0 && password === confirm;
  const passwordTooShort = password.length > 0 && password.length < 6;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background blobs */}
      <motion.div
        aria-hidden
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(255,46,147,0.3), transparent 65%)" }}
        animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(33,212,253,0.25), transparent 65%)" }}
        animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-2xl font-bold tracking-tight">Festa</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur-xl p-8 shadow-2xl"
        >
          {done ? (
            /* Success state */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Password Updated!</h1>
              <p className="text-muted-foreground text-sm">
                Redirecting you to login...
              </p>
            </motion.div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Set New Password</h1>
                  <p className="text-xs text-muted-foreground">
                    {ready ? "Choose a strong password you'll remember." : "Verifying your reset link..."}
                  </p>
                </div>
              </div>

              {!ready && (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                </div>
              )}

              {ready && (
                <form onSubmit={submit} className="space-y-5">
                  {/* New Password */}
                  <div>
                    <Label htmlFor="password" className="text-sm font-medium">
                      New password
                    </Label>
                    <div className="relative mt-1.5">
                      <Input
                        id="password"
                        type={showPass ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        placeholder="At least 6 characters"
                        className={`pr-10 ${passwordTooShort ? "border-red-500/50 focus-visible:ring-red-500/30" : ""}`}
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordTooShort && (
                      <p className="text-xs text-red-500 mt-1">Must be at least 6 characters</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <Label htmlFor="confirm" className="text-sm font-medium">
                      Confirm password
                    </Label>
                    <div className="relative mt-1.5">
                      <Input
                        id="confirm"
                        type={showConfirm ? "text" : "password"}
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        required
                        minLength={6}
                        placeholder="Re-type your new password"
                        className={`pr-10 ${
                          confirm.length > 0 && !passwordsMatch
                            ? "border-red-500/50 focus-visible:ring-red-500/30"
                            : passwordsMatch
                              ? "border-green-500/50 focus-visible:ring-green-500/30"
                              : ""
                        }`}
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {confirm.length > 0 && !passwordsMatch && (
                      <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
                    )}
                    {passwordsMatch && (
                      <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Passwords match
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={busy || !passwordsMatch || passwordTooShort}
                    className="w-full gradient-gold text-primary-foreground hover:opacity-90 font-semibold h-11 mt-2"
                  >
                    {busy ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Updating...
                      </span>
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </form>
              )}
            </>
          )}
        </motion.div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Remember your password?{" "}
          <Link to="/auth" className="text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
