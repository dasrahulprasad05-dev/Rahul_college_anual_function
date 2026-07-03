import { collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, query, where, runTransaction } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Ticket {
  id: string;
  user_id: string;
  event_id: string;
  item_id: string;
  qr_token: string;
  status: "paid" | "used" | "cancelled";
  price_cents: number;
  created_at: string;
  used_at?: string;
  used_by?: string; // volunteer ID who scanned it
}

export const ticketsService = {
  async getUserTickets(userId: string) {
    const q = query(collection(db, "tickets"), where("user_id", "==", userId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Ticket));
  },

  async getTicketByToken(qrToken: string) {
    const q = query(collection(db, "tickets"), where("qr_token", "==", qrToken));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as Ticket;
  },

  // Atomic transaction to prevent double booking
  async bookTicket(userId: string, eventId: string, itemId: string) {
    const itemRef = doc(db, `events/${eventId}/items/${itemId}`);
    const newTicketRef = doc(collection(db, "tickets"));
    const qrToken = `qr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    await runTransaction(db, async (transaction) => {
      const itemDoc = await transaction.get(itemRef);
      if (!itemDoc.exists()) throw new Error("Item not found");

      const itemData = itemDoc.data();
      if (itemData.capacity != null && itemData.booked_count >= itemData.capacity) {
        throw new Error("Item is fully booked!");
      }

      // Update booked_count
      transaction.update(itemRef, { booked_count: (itemData.booked_count || 0) + 1 });

      // Create ticket
      const ticketData: Omit<Ticket, "id"> = {
        user_id: userId,
        event_id: eventId,
        item_id: itemId,
        qr_token: qrToken,
        status: "paid",
        price_cents: itemData.price_cents || 0,
        created_at: new Date().toISOString()
      };
      transaction.set(newTicketRef, ticketData);
    });

    return newTicketRef.id;
  },

  // Atomic check-in
  async checkInTicket(qrToken: string, volunteerId: string) {
    const ticket = await this.getTicketByToken(qrToken);
    if (!ticket) throw new Error("Invalid ticket");
    if (ticket.status === "used") throw new Error("Ticket already used");
    if (ticket.status === "cancelled") throw new Error("Ticket was cancelled");

    await updateDoc(doc(db, "tickets", ticket.id), {
      status: "used",
      used_at: new Date().toISOString(),
      used_by: volunteerId
    });

    return ticket;
  }
};
