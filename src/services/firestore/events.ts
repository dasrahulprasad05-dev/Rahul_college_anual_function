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
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface AppEvent {
  id: string;
  name: string;
  description?: string;
  event_date?: string;
  venue?: string;
  category?: string;
  image_url?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventItem {
  id: string;
  event_id: string;
  name: string;
  description?: string;
  starts_at?: string;
  capacity?: number;
  booked_count: number;
  price_cents: number;
  venue?: string;
  category?: string;
}

export const eventsService = {
  // Event CRUD
  async getEvents(publishedOnly = false) {
    const eventsRef = collection(db, "events");
    let q = query(eventsRef, orderBy("event_date", "asc"));
    if (publishedOnly) {
      q = query(eventsRef, where("is_published", "==", true), orderBy("event_date", "asc"));
    }
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as AppEvent);
  },

  async getEvent(id: string) {
    const d = await getDoc(doc(db, "events", id));
    if (!d.exists()) return null;
    return { id: d.id, ...d.data() } as AppEvent;
  },

  async createEvent(data: Omit<AppEvent, "id">) {
    const newDoc = doc(collection(db, "events"));
    await setDoc(newDoc, data);
    return newDoc.id;
  },

  async updateEvent(id: string, data: Partial<AppEvent>) {
    await updateDoc(doc(db, "events", id), data);
  },

  async deleteEvent(id: string) {
    await deleteDoc(doc(db, "events", id));
  },

  // Event Items CRUD (nested subcollection)
  async getEventItems(eventId: string) {
    const itemsRef = collection(db, `events/${eventId}/items`);
    const snap = await getDocs(itemsRef);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as EventItem);
  },

  async createEventItem(eventId: string, data: Omit<EventItem, "id" | "event_id">) {
    const newDoc = doc(collection(db, `events/${eventId}/items`));
    await setDoc(newDoc, { ...data, event_id: eventId });
    return newDoc.id;
  },
};
