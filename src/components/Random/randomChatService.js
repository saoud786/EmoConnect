import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../Firebase";

/* ✅ CONTINUE CHAT */
export const continueChat = async (chatId, userId) => {
  const chatRef = doc(db, "randomChats", chatId);

  await updateDoc(chatRef, {
    continueUsers: [userId], // later merge logic bhi laga sakte
  });
};

/* ✅ SAVE CHAT (when both users continue) */
export const saveChat = async (chatId) => {
  const chatRef = doc(db, "randomChats", chatId);

  await updateDoc(chatRef, {
    isSaved: true
  });
};

/* ❌ END CHAT */
export const endChat = async (chatId) => {
  await deleteDoc(doc(db, "randomChats", chatId));
};