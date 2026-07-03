import { collection, doc, getDocs, setDoc, query, where, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AppUser } from "@/context/AuthContext";

export const volunteersService = {
  // Check if volunteer is assigned to event
  async isAssigned(eventId: string, volunteerId: string) {
    const d = await getDocs(query(collection(db, `event_volunteers`), where("event_id", "==", eventId), where("user_id", "==", volunteerId)));
    return !d.empty;
  },

  async assignVolunteer(eventId: string, volunteerId: string) {
    const newRef = doc(collection(db, "event_volunteers"));
    await setDoc(newRef, { event_id: eventId, user_id: volunteerId, assigned_at: new Date().toISOString() });
  },

  async unassignVolunteer(eventId: string, volunteerId: string) {
    const d = await getDocs(query(collection(db, `event_volunteers`), where("event_id", "==", eventId), where("user_id", "==", volunteerId)));
    for (const docSnap of d.docs) {
      await deleteDoc(docSnap.ref);
    }
  },

  async getAssignedEvents(volunteerId: string) {
    const d = await getDocs(query(collection(db, `event_volunteers`), where("user_id", "==", volunteerId)));
    return d.docs.map(doc => doc.data().event_id as string);
  }
};
