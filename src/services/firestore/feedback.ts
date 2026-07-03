import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Feedback {
  id: string;
  user_id: string;
  ticket_id: string;
  event_id: string;
  rating: number; // 1-5
  comment: string;
  created_at: string;
}

export const feedbackService = {
  async getEventFeedback(eventId: string) {
    const q = query(collection(db, "feedback"), where("event_id", "==", eventId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Feedback);
  },

  async getTicketFeedback(ticketId: string) {
    const q = query(collection(db, "feedback"), where("ticket_id", "==", ticketId));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as Feedback;
  },

  async submitFeedback(data: Omit<Feedback, "id" | "created_at">) {
    const feedbackRef = doc(collection(db, "feedback"));
    const feedback: Omit<Feedback, "id"> = {
      ...data,
      created_at: new Date().toISOString(),
    };
    await setDoc(feedbackRef, feedback);
    return feedbackRef.id;
  },
};
