import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { gatePassService } from "@/services/firestore/gate-passes";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Upload, FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { GatePassPDF } from "@/components/gate-pass/GatePassPDF";

export const Route = createFileRoute("/_authenticated/gate-pass")({
  component: GatePassPage,
});

function GatePassPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: pass, isLoading } = useQuery({
    queryKey: ["gatePass", user?.id],
    queryFn: () => gatePassService.getGatePass(user!.id),
    enabled: !!user?.id,
  });

  const applyMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error("Not authenticated");
      return await gatePassService.applyForGatePass(user.id, user.email, file);
    },
    onSuccess: () => {
      toast.success("Gate pass application submitted!");
      queryClient.invalidateQueries({ queryKey: ["gatePass", user?.id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleApply = () => {
    if (!file) return toast.error("Please upload a photo first");
    applyMutation.mutate(file);
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div></div>;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="font-display text-4xl md:text-5xl uppercase tracking-tight mb-2 text-gradient-neon">
          Gate Pass
        </h1>
        <p className="text-muted-foreground mb-12">
          Request your official college fest gate pass for campus entry.
        </p>

        {pass ? (
          <div className="rounded-2xl border border-border/60 bg-card/60 p-8 backdrop-blur text-center">
            {pass.status === "pending" && (
              <>
                <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Application Under Review</h2>
                <p className="text-muted-foreground">
                  Your gate pass application is currently pending admin approval. Check back later.
                </p>
              </>
            )}

            {pass.status === "rejected" && (
              <>
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Application Rejected</h2>
                <p className="text-muted-foreground">
                  Please contact the admin team for more information.
                </p>
              </>
            )}

            {pass.status === "approved" && (
              <>
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Gate Pass Approved!</h2>
                <p className="text-muted-foreground mb-8">
                  Your pass is ready. You must carry a printed or digital copy to enter the campus.
                </p>
                <div className="flex justify-center">
                  <PDFDownloadLink
                    document={<GatePassPDF passId={pass.id} userEmail={pass.user_email || "User"} photoUrl={pass.photo_url} />}
                    fileName={`festa-gate-pass-${pass.id}.pdf`}
                  >
                    {({ loading }) => (
                      <Button className="gradient-gold text-primary-foreground" disabled={loading}>
                        <FileText className="w-4 h-4 mr-2" />
                        {loading ? "Generating PDF..." : "Download Gate Pass (PDF)"}
                      </Button>
                    )}
                  </PDFDownloadLink>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-border/60 bg-card/60 p-8 backdrop-blur">
            <h2 className="text-xl font-bold mb-4">Apply for a Gate Pass</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Passport Size Photo</label>
                <div 
                  className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-accent transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-4" />
                  {file ? (
                    <span className="text-foreground font-medium">{file.name}</span>
                  ) : (
                    <span className="text-muted-foreground">Click to upload a clear photo of yourself</span>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              <Button
                className="w-full gradient-gold text-primary-foreground"
                disabled={!file || applyMutation.isPending}
                onClick={handleApply}
              >
                {applyMutation.isPending ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
