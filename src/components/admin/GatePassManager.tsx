import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gatePassService, GatePass } from "@/services/firestore/gate-passes";
import { Button } from "@/components/ui/button";
import { Check, X, FileText, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { GatePassPDF } from "@/components/gate-pass/GatePassPDF";

export function GatePassManager() {
  const queryClient = useQueryClient();

  const { data: passes, isLoading } = useQuery({
    queryKey: ["gatePasses-admin"],
    queryFn: () => gatePassService.getAllPasses(),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "approved" | "rejected" }) => {
      await gatePassService.updateStatus(id, status);
    },
    onSuccess: () => {
      toast.success("Gate pass status updated");
      queryClient.invalidateQueries({ queryKey: ["gatePasses-admin"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <div className="text-muted-foreground p-8">Loading gate passes...</div>;
  if (!passes?.length) return <div className="text-muted-foreground p-8">No gate passes requested yet.</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Gate Passes</h2>
        <p className="text-muted-foreground text-sm">Review and approve entry gate passes.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {passes.map((pass) => (
          <div key={pass.id} className="rounded-xl border border-border/60 bg-card/60 overflow-hidden flex flex-col">
            <div className="aspect-square bg-muted relative group">
              <img src={pass.photo_url} alt="Gate Pass Photo" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <a href={pass.photo_url} target="_blank" rel="noreferrer" className="text-white flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" /> View full
                </a>
              </div>
            </div>
            
            <div className="p-4 flex flex-col flex-1">
              <div className="mb-4">
                <div className="font-medium truncate">{pass.user_email || pass.user_id}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Requested: {new Date(pass.created_at).toLocaleDateString()}
                </div>
                
                <div className="mt-2">
                  {pass.status === "pending" && <span className="text-xs bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded-full">Pending</span>}
                  {pass.status === "approved" && <span className="text-xs bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-0.5 rounded-full">Approved</span>}
                  {pass.status === "rejected" && <span className="text-xs bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded-full">Rejected</span>}
                </div>
              </div>

              <div className="mt-auto space-y-2">
                {pass.status === "pending" && (
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 hover:bg-green-500/10 hover:text-green-500 hover:border-green-500/50"
                      onClick={() => updateStatus.mutate({ id: pass.id, status: "approved" })}
                      disabled={updateStatus.isPending}
                    >
                      <Check className="w-4 h-4 mr-1" /> Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50"
                      onClick={() => updateStatus.mutate({ id: pass.id, status: "rejected" })}
                      disabled={updateStatus.isPending}
                    >
                      <X className="w-4 h-4 mr-1" /> Reject
                    </Button>
                  </div>
                )}
                
                {pass.status === "approved" && (
                  <PDFDownloadLink
                    document={<GatePassPDF passId={pass.id} userEmail={pass.user_email || "User"} photoUrl={pass.photo_url} />}
                    fileName={`festa-gate-pass-${pass.id}.pdf`}
                  >
                    {({ loading }) => (
                      <Button size="sm" variant="outline" className="w-full" disabled={loading}>
                        <FileText className="w-4 h-4 mr-2" />
                        {loading ? "Loading PDF..." : "Download PDF"}
                      </Button>
                    )}
                  </PDFDownloadLink>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
