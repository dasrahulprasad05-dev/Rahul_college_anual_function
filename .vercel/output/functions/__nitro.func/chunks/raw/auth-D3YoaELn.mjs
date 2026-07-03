import { u as useAuth, a as auth, d as db } from './router-j_9pWM7h.mjs';
import { B as Button } from './button-DRsC1qZi.mjs';
import { L as Label, I as Input } from './label-CmIE8x5o.mjs';
import { useState, useEffect } from 'react';
import { useNavigate, useSearch, Link } from '@tanstack/react-router';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { toast } from 'sonner';
import { Sparkles, EyeOff, Eye, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  return /* @__PURE__ */ jsxs(motion.div, {
    initial: {
      opacity: 0,
      y: -6
    },
    animate: {
      opacity: 1,
      y: 0
    },
    className: "mt-3 space-y-2",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "flex items-center gap-2",
      children: [/* @__PURE__ */ jsx("div", {
        className: "flex-1 h-1.5 bg-muted rounded-full overflow-hidden",
        children: /* @__PURE__ */ jsx(motion.div, {
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
function AuthPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/auth" });
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!loading && user)
      navigate({ to: redirect != null ? redirect : "/tickets" });
  }, [
    user,
    loading,
    navigate,
    redirect
  ]);
  const isPasswordValid = mode === "signup" ? rules.every((r) => r.test(password)) : true;
  async function submit(e) {
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
          email,
          role: "student",
          created_at: (/* @__PURE__ */ new Date()).toISOString()
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
      const cred = await signInWithPopup(auth, new GoogleAuthProvider());
      await setDoc(doc(db, "users", cred.user.uid), {
        full_name: cred.user.displayName,
        email: cred.user.email,
        role: "student",
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      }, { merge: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
    }
  }
  return /* @__PURE__ */ jsxs("div", {
    className: "min-h-screen flex items-center justify-center px-4 relative overflow-hidden",
    children: [
      /* @__PURE__ */ jsx(motion.div, {
        "aria-hidden": true,
        className: "absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl pointer-events-none",
        style: { background: "radial-gradient(circle, rgba(255,46,147,0.25), transparent 65%)" },
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
        style: { background: "radial-gradient(circle, rgba(33,212,253,0.2), transparent 65%)" },
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
        children: [/* @__PURE__ */ jsxs(Link, {
          to: "/",
          className: "flex items-center justify-center gap-2 mb-8",
          children: [/* @__PURE__ */ jsx("div", {
            className: "w-10 h-10 rounded-xl gradient-gold flex items-center justify-center shadow-lg",
            children: /* @__PURE__ */ jsx(Sparkles, { className: "w-5 h-5 text-primary-foreground" })
          }), /* @__PURE__ */ jsx("span", {
            className: "font-display text-2xl font-bold tracking-tight",
            children: "Festa"
          })]
        }), /* @__PURE__ */ jsxs(motion.div, {
          initial: {
            opacity: 0,
            y: 20
          },
          animate: {
            opacity: 1,
            y: 0
          },
          transition: { duration: 0.4 },
          className: "rounded-2xl border border-border/60 bg-card/70 backdrop-blur-xl p-8 shadow-2xl",
          children: [
            /* @__PURE__ */ jsx("h1", {
              className: "text-2xl font-bold",
              children: mode === "signin" ? "Welcome back" : mode === "signup" ? "Create account" : "Reset password"
            }),
            /* @__PURE__ */ jsx("p", {
              className: "text-sm text-muted-foreground mt-1 mb-6",
              children: mode === "signin" ? "Sign in to book and view your tickets." : mode === "signup" ? "Sign up to start booking tickets." : "Enter your email and we'll send you a reset link."
            }),
            mode !== "forgot" && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs(Button, {
              onClick: google,
              variant: "outline",
              className: "w-full",
              children: [/* @__PURE__ */ jsx("svg", {
                className: "w-4 h-4 mr-2",
                viewBox: "0 0 24 24",
                children: /* @__PURE__ */ jsx("path", {
                  fill: "currentColor",
                  d: "M21.35 11.1H12v3.2h5.35c-.23 1.47-1.7 4.3-5.35 4.3-3.22 0-5.85-2.66-5.85-5.95s2.63-5.95 5.85-5.95c1.83 0 3.06.78 3.76 1.45l2.56-2.47C16.85 3.97 14.65 3 12 3 6.97 3 3 6.97 3 12s3.97 9 9 9c5.2 0 8.65-3.66 8.65-8.8 0-.6-.07-1.04-.3-1.1z"
                })
              }), "Continue with Google"]
            }), /* @__PURE__ */ jsxs("div", {
              className: "flex items-center gap-3 my-5",
              children: [
                /* @__PURE__ */ jsx("div", { className: "h-px flex-1 bg-border" }),
                /* @__PURE__ */ jsx("span", {
                  className: "text-xs text-muted-foreground",
                  children: "OR"
                }),
                /* @__PURE__ */ jsx("div", { className: "h-px flex-1 bg-border" })
              ]
            })] }),
            /* @__PURE__ */ jsxs("form", {
              onSubmit: submit,
              className: "space-y-4",
              children: [
                mode === "signup" && /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(Label, {
                  htmlFor: "name",
                  children: "Full name"
                }), /* @__PURE__ */ jsx(Input, {
                  id: "name",
                  value: name,
                  onChange: (e) => setName(e.target.value),
                  required: true,
                  placeholder: "Your full name",
                  className: "mt-1.5"
                })] }),
                /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(Label, {
                  htmlFor: "email",
                  children: "Email"
                }), /* @__PURE__ */ jsx(Input, {
                  id: "email",
                  type: "email",
                  value: email,
                  onChange: (e) => setEmail(e.target.value),
                  required: true,
                  placeholder: "you@example.com",
                  className: "mt-1.5"
                })] }),
                mode !== "forgot" && /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsxs("div", {
                    className: "flex items-center justify-between",
                    children: [/* @__PURE__ */ jsx(Label, {
                      htmlFor: "password",
                      children: "Password"
                    }), mode === "signin" && /* @__PURE__ */ jsx("button", {
                      type: "button",
                      onClick: () => setMode("forgot"),
                      className: "text-xs text-primary hover:underline",
                      children: "Forgot password?"
                    })]
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    className: "relative mt-1.5",
                    children: [/* @__PURE__ */ jsx(Input, {
                      id: "password",
                      type: showPassword ? "text" : "password",
                      value: password,
                      onChange: (e) => setPassword(e.target.value),
                      required: true,
                      minLength: 6,
                      placeholder: mode === "signup" ? "Create a strong password" : "Your password",
                      className: "pr-10"
                    }), /* @__PURE__ */ jsx("button", {
                      type: "button",
                      tabIndex: -1,
                      onClick: () => setShowPassword(!showPassword),
                      className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors",
                      children: showPassword ? /* @__PURE__ */ jsx(EyeOff, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(Eye, { className: "w-4 h-4" })
                    })]
                  }),
                  /* @__PURE__ */ jsx(AnimatePresence, { children: mode === "signup" && /* @__PURE__ */ jsx(PasswordStrengthMeter, { password }) })
                ] }),
                /* @__PURE__ */ jsx(Button, {
                  type: "submit",
                  disabled: busy || mode === "signup" && !isPasswordValid,
                  className: "w-full gradient-gold text-primary-foreground hover:opacity-90 h-11 font-semibold mt-2",
                  children: busy ? /* @__PURE__ */ jsxs("span", {
                    className: "flex items-center gap-2",
                    children: [/* @__PURE__ */ jsx("div", { className: "w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" }), "Please wait..."]
                  }) : mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"
                })
              ]
            }),
            /* @__PURE__ */ jsx("p", {
              className: "text-sm text-center text-muted-foreground mt-5",
              children: mode === "forgot" ? /* @__PURE__ */ jsx("button", {
                onClick: () => setMode("signin"),
                className: "text-primary hover:underline",
                children: "Back to sign in"
              }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                mode === "signin" ? "New here?" : "Already have an account?",
                " ",
                /* @__PURE__ */ jsx("button", {
                  onClick: () => {
                    setMode(mode === "signin" ? "signup" : "signin");
                    setPassword("");
                  },
                  className: "text-primary hover:underline",
                  children: mode === "signin" ? "Create an account" : "Sign in"
                })
              ] })
            })
          ]
        })]
      })
    ]
  });
}

export { AuthPage as component };
//# sourceMappingURL=auth-D3YoaELn.mjs.map
