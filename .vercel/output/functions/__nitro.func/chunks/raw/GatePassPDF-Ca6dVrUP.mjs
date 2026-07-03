import { d as db, s as storage } from './router-j_9pWM7h.mjs';
import { jsx, jsxs } from 'react/jsx-runtime';
import { getDocs, query, collection, where, doc, setDoc, orderBy, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { StyleSheet, Document, Page, View, Text, Image } from '@react-pdf/renderer';

var gatePassService = {
  async getGatePass(userId) {
    const snap = await getDocs(query(collection(db, "gate_passes"), where("user_id", "==", userId)));
    if (snap.empty)
      return null;
    return {
      id: snap.docs[0].id,
      ...snap.docs[0].data()
    };
  },
  async applyForGatePass(userId, userEmail, file) {
    const ext = file.name.split(".").pop();
    const storageRef = ref(storage, `gate-passes/${userId}-${Date.now()}.${ext}`);
    await uploadBytes(storageRef, file);
    const photoUrl = await getDownloadURL(storageRef);
    const passRef = doc(collection(db, "gate_passes"));
    await setDoc(passRef, {
      user_id: userId,
      user_email: userEmail || "",
      photo_url: photoUrl,
      status: "pending",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    });
    return passRef.id;
  },
  async getAllPasses(status) {
    let q = query(collection(db, "gate_passes"), orderBy("created_at", "desc"));
    if (status)
      q = query(collection(db, "gate_passes"), where("status", "==", status), orderBy("created_at", "desc"));
    return (await getDocs(q)).docs.map((d) => ({
      id: d.id,
      ...d.data()
    }));
  },
  async updateStatus(passId, status) {
    await updateDoc(doc(db, "gate_passes", passId), {
      status,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
};
var styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#0B0B12",
    padding: 30,
    color: "#ffffff",
    fontFamily: "Helvetica"
  },
  card: {
    border: "2pt solid #FF3D8A",
    borderRadius: 20,
    padding: 30,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  },
  header: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#F5B301",
    textAlign: "center",
    marginBottom: 10,
    textTransform: "uppercase"
  },
  subHeader: {
    fontSize: 14,
    color: "#9A9AAE",
    textAlign: "center",
    marginBottom: 40,
    letterSpacing: 2,
    textTransform: "uppercase"
  },
  photoContainer: {
    alignItems: "center",
    marginBottom: 40
  },
  photo: {
    width: 200,
    height: 200,
    borderRadius: 100,
    border: "4pt solid #FF3D8A",
    objectFit: "cover"
  },
  details: { alignItems: "center" },
  email: {
    fontSize: 18,
    marginBottom: 10
  },
  passId: {
    fontSize: 12,
    color: "#9A9AAE",
    fontFamily: "Courier"
  },
  footer: {
    marginTop: "auto",
    textAlign: "center",
    fontSize: 12,
    color: "#9A9AAE"
  }
});
function GatePassPDF({ passId, userEmail, photoUrl }) {
  return /* @__PURE__ */ jsx(Document, { children: /* @__PURE__ */ jsx(Page, {
    size: "A5",
    style: styles.page,
    children: /* @__PURE__ */ jsxs(View, {
      style: styles.card,
      children: [/* @__PURE__ */ jsxs(View, { children: [
        /* @__PURE__ */ jsx(Text, {
          style: styles.header,
          children: "Festa 2026"
        }),
        /* @__PURE__ */ jsx(Text, {
          style: styles.subHeader,
          children: "Official Gate Pass"
        }),
        /* @__PURE__ */ jsx(View, {
          style: styles.photoContainer,
          children: /* @__PURE__ */ jsx(Image, {
            src: photoUrl,
            style: styles.photo
          })
        }),
        /* @__PURE__ */ jsxs(View, {
          style: styles.details,
          children: [/* @__PURE__ */ jsx(Text, {
            style: styles.email,
            children: userEmail
          }), /* @__PURE__ */ jsxs(Text, {
            style: styles.passId,
            children: ["PASS ID: ", passId]
          })]
        })
      ] }), /* @__PURE__ */ jsx(Text, {
        style: styles.footer,
        children: "Valid for entry to all general events."
      })]
    })
  }) });
}

export { GatePassPDF as G, gatePassService as g };
//# sourceMappingURL=GatePassPDF-Ca6dVrUP.mjs.map
