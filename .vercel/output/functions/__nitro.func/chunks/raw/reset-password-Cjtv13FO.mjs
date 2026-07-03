import { a as auth } from './router-j_9pWM7h.mjs';
import { B as Button } from './button-DRsC1qZi.mjs';
import { L as Label, I as Input } from './label-CmIE8x5o.mjs';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { toast } from 'sonner';
import { Sparkles, CheckCircle2, ShieldCheck, EyeOff, Eye, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import 'firebase/firestore';
import 'firebase/app';
import 'firebase/storage';
import '@tanstack/react-query';
import 'zod';
import '@radix-ui/react-slot';
import 'class-variance-authority';
import 'clsx';
import 'tailwind-merge';
import '@radix-ui/react-label';

var rules = [
  {
    id: "length",
    label: "At least 6 characters",
    test: (p) => p.length >= 6
  },
  {
    id: "upper",
    label: "One uppercase letter (A-Z)",
    test: (p) => /[A-Z]/.test(p)
  },
  {
    id: "special",
    label: "One special character (!@#$...)",
    test: (p) => /[^a-zA-Z0-9]/.test(p)
  }
];
function PasswordStrengthMeter({ password }) {
  if (!password)
    return null;
  const passed = rules.filter((r) => r.test(password)).length;
  const strength = passed === 0 ? 0 : passed === 1 ? 33 : passed === 2 ? 66 : 100;
  const color = strength <= 33 ? "#ef4444" : strength <= 66 ? "#f59e0b" : "#22c55e";
  const label = strength <= 33 ? "Weak" : strength <= 66 ? "Medium" : "Strong";
  return /* @__PURE__ */ jsxs("div", {
    className: "mt-3 space-y-2",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "flex items-center gap-2",
      children: [/* @__PURE__ */ jsx("div", {
        className: "flex-1 h-1.5 bg-muted rounded-full overflow-hidden",
        children: /* @__PURE__ */ jsx("div", {
          className: "h-full rounded-full transition-all duration-500",
          style: {
            width: `${strength}%`,
            backgroundColor: color
          }
        })
      }), /* @__PURE__ */ jsx("span", {
        className: "text-xs font-medium",
        style: { color },
        children: label
      })]
    }), /* @__PURE__ */ jsx("div", {
      className: "space-y-1",
      children: rules.map((rule) => {
        const ok = rule.test(password);
        return /* @__PURE__ */ jsxs("div", {
          className: "flex items-center gap-2",
          children: [ok ? /* @__PURE__ */ jsx(CheckCircle2, { className: "w-3.5 h-3.5 text-green-500 shrink-0" }) : /* @__PURE__ */ jsx(XCircle, { className: "w-3.5 h-3.5 text-muted-foreground shrink-0" }), /* @__PURE__ */ jsx("span", {
            className: `text-xs ${ok ? "text-green-500" : "text-muted-foreground"}`,
            children: rule.label
          })]
        }, rule.id);
      })
    })]
  });
}
function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [oobCode, setOobCode] = useState(null);
  const isPasswordStrong = rules.every((r) => r.test(password));
  const passwordsMatch = confirm.length > 0 && password === confirm;
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("oobCode");
    if (code)
      verifyPasswordResetCode(auth, code).then(() => {
        setOobCode(code);
        setReady(true);
      }).catch(() => {
        toast.error("Invalid or expired reset link. Please request a new one.");
      });
    else
      toast.error("Missing reset code.");
  }, []);
  async function submit(e) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords don't match");
      return;
    }
    if (!oobCode)
      return;
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
  return /* @__PURE__ */ jsxs("div", {
    className: "min-h-screen flex items-center justify-center px-4 relative overflow-hidden",
    children: [
      /* @__PURE__ */ jsx(motion.div, {
        "aria-hidden": true,
        className: "absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl pointer-events-none",
        style: { background: "radial-gradient(circle, rgba(255,46,147,0.3), transparent 65%)" },
        animate: {
          x: [
            0,
            30,
            0
          ],
          y: [
            0,
            20,
            0
          ]
        },
        transition: {
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }),
      /* @__PURE__ */ jsx(motion.div, {
        "aria-hidden": true,
        className: "absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl pointer-events-none",
        style: { background: "radial-gradient(circle, rgba(33,212,253,0.25), transparent 65%)" },
        animate: {
          x: [
            0,
            -30,
            0
          ],
          y: [
            0,
            -20,
            0
          ]
        },
        transition: {
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }),
      /* @__PURE__ */ jsxs("div", {
        className: "w-full max-w-md relative z-10",
        children: [
          /* @__PURE__ */ jsxs(Link, {
            to: "/",
            className: "flex items-center justify-center gap-2 mb-8",
            children: [/* @__PURE__ */ jsx("div", {
              className: "w-10 h-10 rounded-xl gradient-gold flex items-center justify-center shadow-lg",
              children: /* @__PURE__ */ jsx(Sparkles, { className: "w-5 h-5 text-primary-foreground" })
            }), /* @__PURE__ */ jsx("span", {
              className: "font-display text-2xl font-bold tracking-tight",
              children: "Festa"
            })]
          }),
          /* @__PURE__ */ jsx(motion.div, {
            initial: {
              opacity: 0,
              y: 20
            },
            animate: {
              opacity: 1,
              y: 0
            },
            transition: { duration: 0.5 },
            className: "rounded-2xl border border-border/60 bg-card/70 backdrop-blur-xl p-8 shadow-2xl",
            children: done ? /* @__PURE__ */ jsxs(motion.div, {
              initial: {
                opacity: 0,
                scale: 0.9
              },
              animate: {
                opacity: 1,
                scale: 1
              },
              className: "text-center py-4",
              children: [
                /* @__PURE__ */ jsx("div", {
                  className: "w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4",
                  children: /* @__PURE__ */ jsx(CheckCircle2, { className: "w-8 h-8 text-green-500" })
                }),
                /* @__PURE__ */ jsx("h1", {
                  className: "text-2xl font-bold mb-2",
                  children: "Password Updated!"
                }),
                /* @__PURE__ */ jsx("p", {
                  className: "text-muted-foreground text-sm",
                  children: "Redirecting you to login..."
                })
              ]
            }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsxs("div", {
                className: "flex items-center gap-3 mb-6",
                children: [/* @__PURE__ */ jsx("div", {
                  className: "w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center",
                  children: /* @__PURE__ */ jsx(ShieldCheck, { className: "w-5 h-5 text-accent" })
                }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
                  className: "text-xl font-bold",
                  children: "Set New Password"
                }), /* @__PURE__ */ jsx("p", {
                  className: "text-xs text-muted-foreground",
                  children: ready ? "Choose a strong password you'll remember." : "Verifying your reset link..."
                })] })]
              }),
              !ready && /* @__PURE__ */ jsx("div", {
                className: "flex items-center justify-center py-8",
                children: /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" })
              }),
              ready && /* @__PURE__ */ jsxs("form", {
                onSubmit: submit,
                className: "space-y-5",
                children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx(Label, {
                      htmlFor: "password",
                      className: "text-sm font-medium",
                      children: "New password"
                    }),
                    /* @__PURE__ */ jsxs("div", {
                      className: "relative mt-1.5",
                      children: [/* @__PURE__ */ jsx(Input, {
                        id: "password",
                        type: showPass ? "text" : "password",
                        value: password,
                        onChange: (e) => setPassword(e.target.value),
                        required: true,
                        minLength: 6,
                        placeholder: "At least 6 characters",
                        className: "pr-10"
                      }), /* @__PURE__ */ jsx("button", {
                        type: "button",
                        tabIndex: -1,
                        onClick: () => setShowPass(!showPass),
                        className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors",
                        children: showPass ? /* @__PURE__ */ jsx(EyeOff, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(Eye, { className: "w-4 h-4" })
                      })]
                    }),
                    /* @__PURE__ */ jsx(PasswordStrengthMeter, { password })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx(Label, {
                      htmlFor: "confirm",
                      className: "text-sm font-medium",
                      children: "Confirm password"
                    }),
                    /* @__PURE__ */ jsxs("div", {
                      className: "relative mt-1.5",
                      children: [/* @__PURE__ */ jsx(Input, {
                        id: "confirm",
                        type: showConfirm ? "text" : "password",
                        value: confirm,
                        onChange: (e) => setConfirm(e.target.value),
                        required: true,
                        minLength: 6,
                        placeholder: "Re-type your new password",
                        className: `pr-10 ${confirm.length > 0 && !passwordsMatch ? "border-red-500/50 focus-visible:ring-red-500/30" : passwordsMatch ? "border-green-500/50 focus-visible:ring-green-500/30" : ""}`
                      }), /* @__PURE__ */ jsx("button", {
                        type: "button",
                        tabIndex: -1,
                        onClick: () => setShowConfirm(!showConfirm),
                        className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors",
                        children: showConfirm ? /* @__PURE__ */ jsx(EyeOff, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(Eye, { className: "w-4 h-4" })
                      })]
                    }),
                    confirm.length > 0 && !passwordsMatch && /* @__PURE__ */ jsx("p", {
                      className: "text-xs text-red-500 mt-1",
                      children: "Passwords don't match"
                    }),
                    passwordsMatch && /* @__PURE__ */ jsxs("p", {
                      className: "text-xs text-green-500 mt-1 flex items-center gap-1",
                      children: [/* @__PURE__ */ jsx(CheckCircle2, { className: "w-3 h-3" }), " Passwords match"]
                    })
                  ] }),
                  /* @__PURE__ */ jsx(Button, {
                    type: "submit",
                    disabled: busy || !passwordsMatch || !isPasswordStrong,
                    className: "w-full gradient-gold text-primary-foreground hover:opacity-90 font-semibold h-11 mt-2",
                    children: busy ? /* @__PURE__ */ jsxs("span", {
                      className: "flex items-center gap-2",
                      children: [/* @__PURE__ */ jsx("div", { className: "w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" }), "Updating..."]
                    }) : "Update Password"
                  })
                ]
              })
            ] })
          }),
          /* @__PURE__ */ jsxs("p", {
            className: "text-center text-xs text-muted-foreground mt-6",
            children: [
              "Remember your password?",
              " ",
              /* @__PURE__ */ jsx(Link, {
                to: "/auth",
                className: "text-accent hover:underline",
                children: "Sign in"
              })
            ]
          })
        ]
      })
    ]
  });
}

export { ResetPasswordPage as component };
//# sourceMappingURL=reset-password-Cjtv13FO.mjs.map
