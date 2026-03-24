import { doc, setDoc } from "firebase/firestore";
import { db } from "../Firebase";

export const saveUserToFirestore = async (user) => {
  if (!user) return;

  await setDoc(
    doc(db, "users", user.uid),
    {
      uid: user.uid,
      email: user.email,

      // ✅ Online system fields
      online: true,
      lastSeen: new Date(),
    },
    { merge: true }
  );
};
