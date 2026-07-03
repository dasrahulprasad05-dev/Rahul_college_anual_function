import { u as useAuth } from './router-j_9pWM7h.mjs';
import { B as Button } from './button-DRsC1qZi.mjs';
import { g as gatePassService, G as GatePassPDF } from './GatePassPDF-Ca6dVrUP.mjs';
import { N as Navbar } from './Navbar-DzHODt_V.mjs';
import { useState, useRef } from 'react';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Clock, AlertCircle, CheckCircle2, FileText, Upload } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/app';
import 'firebase/storage';
import '@tanstack/react-router';
import 'zod';
import '@radix-ui/react-slot';
import 'class-variance-authority';
import 'clsx';
import 'tailwind-merge';
import 'framer-motion';

function GatePassPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const { data: pass, isLoading } = useQuery({
    queryKey: ["gatePass", user == null ? void 0 : user.id],
    queryFn: () => gatePassService.getGatePass(user.id),
    enabled: !!(user == null ? void 0 : user.id)
  });
  const applyMutation = useMutation({
    mutationFn: async (file2) => {
      if (!user) throw new Error("Not authenticated");
      return await gatePassService.applyForGatePass(user.id, user.email, file2);
    },
    onSuccess: () => {
      toast.success("Gate pass application submitted!");
      queryClient.invalidateQueries({ queryKey: ["gatePass", user == null ? void 0 : user.id] });
    },
    onError: (e) => toast.error(e.message)
  });
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };
  const handleApply = () => {
    if (!file) return toast.error("Please upload a photo first");
    applyMutation.mutate(file);
  };
  if (isLoading) return /* @__PURE__ */ jsx("div", {
    className: "min-h-screen flex items-center justify-center",
    children: /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-accent" })
  });
  return /* @__PURE__ */ jsxs("div", {
    className: "min-h-screen",
    children: [/* @__PURE__ */ jsx(Navbar, {}), /* @__PURE__ */ jsxs("div", {
      className: "max-w-3xl mx-auto px-4 py-16",
      children: [
        /* @__PURE__ */ jsx("h1", {
          className: "font-display text-4xl md:text-5xl uppercase tracking-tight mb-2 text-gradient-neon",
          children: "Gate Pass"
        }),
        /* @__PURE__ */ jsx("p", {
          className: "text-muted-foreground mb-12",
          children: "Request your official college fest gate pass for campus entry."
        }),
        pass ? /* @__PURE__ */ jsxs("div", {
          className: "rounded-2xl border border-border/60 bg-card/60 p-8 backdrop-blur text-center",
          children: [
            pass.status === "pending" && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("div", {
                className: "w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4",
                children: /* @__PURE__ */ jsx(Clock, { className: "w-8 h-8 text-yellow-500" })
              }),
              /* @__PURE__ */ jsx("h2", {
                className: "text-2xl font-bold mb-2",
                children: "Application Under Review"
              }),
              /* @__PURE__ */ jsx("p", {
                className: "text-muted-foreground",
                children: "Your gate pass application is currently pending admin approval. Check back later."
              })
            ] }),
            pass.status === "rejected" && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("div", {
                className: "w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4",
                children: /* @__PURE__ */ jsx(AlertCircle, { className: "w-8 h-8 text-red-500" })
              }),
              /* @__PURE__ */ jsx("h2", {
                className: "text-2xl font-bold mb-2",
                children: "Application Rejected"
              }),
              /* @__PURE__ */ jsx("p", {
                className: "text-muted-foreground",
                children: "Please contact the admin team for more information."
              })
            ] }),
            pass.status === "approved" && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("div", {
                className: "w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4",
                children: /* @__PURE__ */ jsx(CheckCircle2, { className: "w-8 h-8 text-green-500" })
              }),
              /* @__PURE__ */ jsx("h2", {
                className: "text-2xl font-bold mb-2",
                children: "Gate Pass Approved!"
              }),
              /* @__PURE__ */ jsx("p", {
                className: "text-muted-foreground mb-8",
                children: "Your pass is ready. You must carry a printed or digital copy to enter the campus."
              }),
              /* @__PURE__ */ jsx("div", {
                className: "flex justify-center",
                children: /* @__PURE__ */ jsx(PDFDownloadLink, {
                  document: /* @__PURE__ */ jsx(GatePassPDF, {
                    passId: pass.id,
                    userEmail: pass.user_email || "User",
                    photoUrl: pass.photo_url
                  }),
                  fileName: `festa-gate-pass-${pass.id}.pdf`,
                  children: ({ loading }) => /* @__PURE__ */ jsxs(Button, {
                    className: "gradient-gold text-primary-foreground",
                    disabled: loading,
                    children: [/* @__PURE__ */ jsx(FileText, { className: "w-4 h-4 mr-2" }), loading ? "Generating PDF..." : "Download Gate Pass (PDF)"]
                  })
                })
              })
            ] })
          ]
        }) : /* @__PURE__ */ jsxs("div", {
          className: "rounded-2xl border border-border/60 bg-card/60 p-8 backdrop-blur",
          children: [/* @__PURE__ */ jsx("h2", {
            className: "text-xl font-bold mb-4",
            children: "Apply for a Gate Pass"
          }), /* @__PURE__ */ jsxs("div", {
            className: "space-y-6",
            children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
              className: "block text-sm font-medium mb-2",
              children: "Passport Size Photo"
            }), /* @__PURE__ */ jsxs("div", {
              className: "border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-accent transition-colors",
              onClick: () => {
                var _a;
                return (_a = fileInputRef.current) == null ? void 0 : _a.click();
              },
              children: [
                /* @__PURE__ */ jsx(Upload, { className: "w-8 h-8 mx-auto text-muted-foreground mb-4" }),
                file ? /* @__PURE__ */ jsx("span", {
                  className: "text-foreground font-medium",
                  children: file.name
                }) : /* @__PURE__ */ jsx("span", {
                  className: "text-muted-foreground",
                  children: "Click to upload a clear photo of yourself"
                }),
                /* @__PURE__ */ jsx("input", {
                  type: "file",
                  ref: fileInputRef,
                  className: "hidden",
                  accept: "image/*",
                  onChange: handleFileChange
                })
              ]
            })] }), /* @__PURE__ */ jsx(Button, {
              className: "w-full gradient-gold text-primary-foreground",
              disabled: !file || applyMutation.isPending,
              onClick: handleApply,
              children: applyMutation.isPending ? "Submitting..." : "Submit Application"
            })]
          })]
        })
      ]
    })]
  });
}

export { GatePassPage as component };
//# sourceMappingURL=gate-pass-DAjQN5mK.mjs.map
