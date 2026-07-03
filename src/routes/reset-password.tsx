import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({ meta: [{ title: "Reset password — Festa" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [oobCode, setOobCode] = useState<string | null>(null);

  useEffect(() => {
    // Firebase includes oobCode in the query string
    const params = new URLSearchParams(window.location.search);
    const code = params.get("oobCode");
    if (code) {
      verifyPasswordResetCode(auth, code)
        .then(() => {
          setOobCode(code);
          setReady(true);
        })
        .catch(() => {
          toast.error("Invalid or expired reset link.");
        });
    } else {
      toast.error("Missing reset code.");
    }
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords don't match");
      return;
    }
    if (!oobCode) return;
    setBusy(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      toast.success("Password updated!");
      navigate({ to: "/auth" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-lg gradient-gold flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-2xl font-bold">Festa</span>
        </Link>

        <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur p-6">
          <h1 className="text-2xl font-bold">Set a new password</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {ready ? "Choose a strong password you'll remember." : "Verifying your reset link..."}
          </p>

          {ready && (
            <form onSubmit={submit} className="space-y-4 mt-6">
              <div>
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="confirm">Confirm password</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={6}
                  className="mt-1.5"
                />
              </div>
              <Button
                type="submit"
                disabled={busy}
                className="w-full gradient-gold text-primary-foreground hover:opacity-90"
              >
                {busy ? "Updating..." : "Update password"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
