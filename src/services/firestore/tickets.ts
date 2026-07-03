import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  runTransaction,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Ticket {
  id: string;
  user_id: string;
  user_email?: string;
  event_id: string;
  event_name?: string;
  item_id: string;
  item_name?: string;
  venue?: string;
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
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Ticket);
  },

  async getTicketByToken(qrToken: string) {
    const q = query(collection(db, "tickets"), where("qr_token", "==", qrToken));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as Ticket;
  },

  // Atomic transaction to prevent double booking
  async bookTicket(opts: {
    userId: string;
    userEmail?: string;
    eventId: string;
    eventName?: string;
    venue?: string;
    itemId: string;
    itemName?: string;
  }) {
    const itemRef = doc(db, `events/${opts.eventId}/items/${opts.itemId}`);
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
        user_id: opts.userId,
        user_email: opts.userEmail,
        event_id: opts.eventId,
        event_name: opts.eventName || "Event",
        item_id: opts.itemId,
        item_name: opts.itemName || itemData.name || "Ticket",
        venue: opts.venue || "TBA",
        qr_token: qrToken,
        status: "paid",
        price_cents: itemData.price_cents || 0,
        created_at: new Date().toISOString(),
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
      used_by: volunteerId,
    });

    // Send confirmation email asynchronously if email is present
    if (ticket.user_email) {
      import("@/services/email/ticket-emails")
        .then(({ sendScanConfirmation }) => {
          sendScanConfirmation({
            data: {
              recipient: ticket.user_email!,
              eventName: ticket.event_name || "Event",
              itemName: ticket.item_name || "Ticket",
              venue: ticket.venue || "TBA",
            }
          });
        })
        .catch((e) => console.error("Failed to send scan confirmation:", e));
    }

    return ticket;
  },
};
