import { d as db } from './router-j_9pWM7h.mjs';
import { getDocs, query, collection, where, doc, setDoc } from 'firebase/firestore';

var feedbackService = {
  async getEventFeedback(eventId) {
    return (await getDocs(query(collection(db, "feedback"), where("event_id", "==", eventId)))).docs.map((d) => ({
      id: d.id,
      ...d.data()
    }));
  },
  async getTicketFeedback(ticketId) {
    const snap = await getDocs(query(collection(db, "feedback"), where("ticket_id", "==", ticketId)));
    if (snap.empty)
      return null;
    return {
      id: snap.docs[0].id,
      ...snap.docs[0].data()
    };
  },
  async submitFeedback(data) {
    const feedbackRef = doc(collection(db, "feedback"));
    await setDoc(feedbackRef, {
      ...data,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    });
    return feedbackRef.id;
  }
};

export { feedbackService as f };
//# sourceMappingURL=feedback-DFqX3JN0.mjs.map
