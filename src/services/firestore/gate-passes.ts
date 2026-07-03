import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

export interface GatePass {
  id: string;
  user_id: string;
  user_email?: string;
  photo_url: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
}

export const gatePassService = {
  async getGatePass(userId: string) {
    const q = query(collection(db, "gate_passes"), where("user_id", "==", userId));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as GatePass;
  },

  async applyForGatePass(userId: string, userEmail: string | undefined | null, file: File) {
    // 1. Upload photo to Firebase Storage
    const ext = file.name.split(".").pop();
    const fileName = `gate-passes/${userId}-${Date.now()}.${ext}`;
    const storageRef = ref(storage, fileName);
    
    await uploadBytes(storageRef, file);
    const photoUrl = await getDownloadURL(storageRef);

    // 2. Create document
    const passRef = doc(collection(db, "gate_passes"));
    const data: Omit<GatePass, "id"> = {
      user_id: userId,
      user_email: userEmail || "",
      photo_url: photoUrl,
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await setDoc(passRef, data);
    return passRef.id;
  },

  async getAllPasses(status?: GatePass["status"]) {
    let q = query(collection(db, "gate_passes"), orderBy("created_at", "desc"));
    if (status) {
      q = query(collection(db, "gate_passes"), where("status", "==", status), orderBy("created_at", "desc"));
    }
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }) as GatePass);
  },

  async updateStatus(passId: string, status: "approved" | "rejected") {
    const passRef = doc(db, "gate_passes", passId);
    await updateDoc(passRef, {
      status,
      updated_at: new Date().toISOString(),
    });
  }
};
