import { d as db } from './router-j_9pWM7h.mjs';
import { updateDoc, doc, collection, runTransaction, getDocs, query, where } from 'firebase/firestore';

var ticketsService = {
  async getUserTickets(userId) {
    return (await getDocs(query(collection(db, "tickets"), where("user_id", "==", userId)))).docs.map((d) => ({
      id: d.id,
      ...d.data()
    }));
  },
  async getTicketByToken(qrToken) {
    const snap = await getDocs(query(collection(db, "tickets"), where("qr_token", "==", qrToken)));
    if (snap.empty) return null;
    return {
      id: snap.docs[0].id,
      ...snap.docs[0].data()
    };
  },
  async bookTicket(opts) {
    const itemRef = doc(db, `events/${opts.eventId}/items/${opts.itemId}`);
    const newTicketRef = doc(collection(db, "tickets"));
    const qrToken = `qr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    await runTransaction(db, async (transaction) => {
      const itemDoc = await transaction.get(itemRef);
      if (!itemDoc.exists()) throw new Error("Item not found");
      const itemData = itemDoc.data();
      if (itemData.capacity != null && itemData.booked_count >= itemData.capacity) throw new Error("Item is fully booked!");
      transaction.update(itemRef, { booked_count: (itemData.booked_count || 0) + 1 });
      const ticketData = {
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
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      transaction.set(newTicketRef, ticketData);
    });
    return newTicketRef.id;
  },
  async checkInTicket(qrToken, volunteerId) {
    const ticket = await this.getTicketByToken(qrToken);
    if (!ticket) throw new Error("Invalid ticket");
    if (ticket.status === "used") throw new Error("Ticket already used");
    if (ticket.status === "cancelled") throw new Error("Ticket was cancelled");
    await updateDoc(doc(db, "tickets", ticket.id), {
      status: "used",
      used_at: (/* @__PURE__ */ new Date()).toISOString(),
      used_by: volunteerId
    });
    if (ticket.user_email) import('./ticket-emails-CQbKuzYy.mjs').then(({ sendScanConfirmation }) => {
      sendScanConfirmation({ data: {
        recipient: ticket.user_email,
        eventName: ticket.event_name || "Event",
        itemName: ticket.item_name || "Ticket",
        venue: ticket.venue || "TBA"
      } });
    }).catch((e) => console.error("Failed to send scan confirmation:", e));
    return ticket;
  }
};

export { ticketsService as t };
//# sourceMappingURL=tickets-DBrl0I-g.mjs.map
