import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { feedbackService } from "@/services/firestore/feedback";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Star, MessageSquareHeart } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

interface FeedbackModalProps {
  ticketId: string;
  eventId: string;
}

export function FeedbackModal({ ticketId, eventId }: FeedbackModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const submit = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not logged in");
      if (rating === 0) throw new Error("Please select a rating");
      
      await feedbackService.submitFeedback({
        ticket_id: ticketId,
        event_id: eventId,
        user_id: user.id,
        rating,
        comment
      });
    },
    onSuccess: () => {
      toast.success("Thanks for your feedback!");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["feedback", ticketId] });
    },
    onError: (e: Error) => toast.error(e.message)
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="mt-2 w-full flex items-center justify-center gap-2">
          <MessageSquareHeart className="w-4 h-4" />
          Leave Feedback
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>How was the event?</DialogTitle>
        </DialogHeader>
        
        <div className="py-6 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none transition-transform hover:scale-110"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                <Star
                  className="w-10 h-10 transition-colors"
                  fill={(hoverRating || rating) >= star ? "#F5B301" : "transparent"}
                  color={(hoverRating || rating) >= star ? "#F5B301" : "currentColor"}
                />
              </button>
            ))}
          </div>

          <Textarea 
            placeholder="Tell us what you liked or what could be improved..." 
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full h-24 resize-none"
          />
        </div>

        <Button 
          className="w-full gradient-gold text-primary-foreground" 
          disabled={rating === 0 || submit.isPending}
          onClick={() => submit.mutate()}
        >
          {submit.isPending ? "Submitting..." : "Submit Feedback"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
