import { useState, useEffect } from "react";
import { db, auth } from "../Firebase";
import {
  collection,
  addDoc,
  query,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
  onSnapshot
} from "firebase/firestore";

export default function useRandomChat() {
  const [loading, setLoading] = useState(false);
  const [chat, setChat] = useState(null);
  const [status, setStatus] = useState("idle");

  const currentUser = auth.currentUser;

  /* 🔥 START MATCHING */
  const startMatching = async () => {
    if (!currentUser) return;

    setLoading(true);
    setStatus("Finding someone...");

    try {
      // ✅ FIXED COLLECTION
      const q = query(collection(db, "waitingUsers"));
      const snapshot = await getDocs(q);

      let foundUser = null;

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();

        // ✅ skip self + pick first user
        if (data.userId !== currentUser.uid && !foundUser) {
          foundUser = {
            id: docSnap.id,       // ✅ important fix
            ...data
          };
        }
      });

      if (foundUser) {
        // 🔥 remove matched user
        await deleteDoc(doc(db, "waitingUsers", foundUser.id));

        // 🔗 create chat
        const chatRef = await addDoc(collection(db, "randomChats"), {
          users: [currentUser.uid, foundUser.userId],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        setChat({
          chatId: chatRef.id,
          uid: foundUser.userId
        });

        setStatus("connected");
        setLoading(false);
      } else {
        // ➕ add self to queue
        await setDoc(doc(db, "waitingUsers", currentUser.uid), {
          userId: currentUser.uid,
          createdAt: serverTimestamp()
        });

        setStatus("waiting");
      }
    } catch (err) {
      console.error("Matching Error:", err);
      setLoading(false);
      setStatus("error");
    }
  };

  /* 🔥 REAL-TIME MATCH LISTENER */
  useEffect(() => {
    if (!currentUser || chat) return;

    const q = query(collection(db, "randomChats"));

    const unsub = onSnapshot(q, (snapshot) => {
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();

        if (data.users?.includes(currentUser.uid)) {
          setChat({
            chatId: docSnap.id,
            uid: data.users.find((u) => u !== currentUser.uid)
          });

          setLoading(false);
          setStatus("connected");
        }
      });
    });

    return () => unsub();
  }, [currentUser, chat]);

  /* 🔥 CANCEL MATCHING */
  const cancelMatching = async () => {
    if (!currentUser) return;

    try {
      await deleteDoc(doc(db, "waitingUsers", currentUser.uid)); // ✅ FIXED
      setLoading(false);
      setStatus("cancelled");
    } catch (err) {
      console.error(err);
    }
  };

  /* 🔥 END CHAT */
  const endChat = async () => {
    if (!chat) return;

    try {
      await deleteDoc(doc(db, "randomChats", chat.chatId));
      setChat(null);
      setStatus("ended");
    } catch (err) {
      console.error(err);
    }
  };

  return {
    loading,
    chat,
    status,
    startMatching,
    cancelMatching,
    endChat
  };
}