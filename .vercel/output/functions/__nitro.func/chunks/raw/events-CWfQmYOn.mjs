import { d as db } from './router-j_9pWM7h.mjs';
import { collection, query, orderBy, where, getDocs, getDoc, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

var eventsService = {
  async getEvents(publishedOnly = false) {
    const eventsRef = collection(db, "events");
    let q = query(eventsRef, orderBy("event_date", "asc"));
    if (publishedOnly)
      q = query(eventsRef, where("is_published", "==", true), orderBy("event_date", "asc"));
    return (await getDocs(q)).docs.map((d) => ({
      id: d.id,
      ...d.data()
    }));
  },
  async getEvent(id) {
    const d = await getDoc(doc(db, "events", id));
    if (!d.exists())
      return null;
    return {
      id: d.id,
      ...d.data()
    };
  },
  async createEvent(data) {
    const newDoc = doc(collection(db, "events"));
    await setDoc(newDoc, data);
    return newDoc.id;
  },
  async updateEvent(id, data) {
    await updateDoc(doc(db, "events", id), data);
  },
  async deleteEvent(id) {
    await deleteDoc(doc(db, "events", id));
  },
  async getEventItems(eventId) {
    return (await getDocs(collection(db, `events/${eventId}/items`))).docs.map((d) => ({
      id: d.id,
      ...d.data()
    }));
  },
  async createEventItem(eventId, data) {
    const newDoc = doc(collection(db, `events/${eventId}/items`));
    await setDoc(newDoc, {
      ...data,
      event_id: eventId
    });
    return newDoc.id;
  }
};

export { eventsService as e };
//# sourceMappingURL=events-CWfQmYOn.mjs.map
