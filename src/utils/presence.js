import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../Firebase";

// ✅ Set Online
export const setUserOnline = async (uid) => {
  if (!uid) return;

  await updateDoc(doc(db, "users", uid), {
    online: true,
  });
};

// ✅ Set Offline + Last Seen
export const setUserOffline = async (uid) => {
  if (!uid) return;

  await updateDoc(doc(db, "users", uid), {
    online: false,
    lastSeen: serverTimestamp(),
  });
};
