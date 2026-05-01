import React, { useEffect, useState } from "react";
import "./RandomPage.css";
import RandomChatWindow from "./RandomChatWindow";
import RandomChatList from "./RandomChatList";
import { db, auth } from "../../Firebase";
import {
  collection,
  addDoc,
  query,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
  onSnapshot,
  where,
  getDoc,
  updateDoc
} from "firebase/firestore";

export default function RandomPage() {

  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [waitMessage, setWaitMessage] = useState("Finding someone for you...");

  const currentUser = auth.currentUser;
const handleSelectChat = (chatData) => {
  setSelectedUser(chatData);
  setLoading(false);
};
  /* ========================= */
  /* 🔥 START MATCHING */

  const startMatching = async () => {
    if (!currentUser) return;

    setLoading(true);
    setWaitMessage("Finding someone for you...");

    try {
      await deleteDoc(doc(db, "waitingUsers", currentUser.uid)).catch(() => {});

      const myDoc = await getDoc(doc(db, "users", currentUser.uid));
      const myProfile = myDoc.data();

      if (!myProfile?.role || !myProfile?.issues?.length || !myProfile?.ageGroup) {
        alert("Please complete your profile first");
        setLoading(false);
        return;
      }

      const myRole = myProfile.role;
      const myEmotion = myProfile.issues[0]?.toLowerCase();
      const myAge = myProfile.ageGroup;

      const q = query(collection(db, "waitingUsers"));
      const snapshot = await getDocs(q);

      let foundUser = null;

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();

        if (!data?.userId || data.userId === currentUser.uid) continue;

        const otherDoc = await getDoc(doc(db, "users", data.userId));
        const otherProfile = otherDoc.data();

        if (!otherProfile?.role || !otherProfile?.issues?.length || !otherProfile?.ageGroup) continue;

        const otherRole = otherProfile.role;
        const otherEmotion = otherProfile.issues[0]?.toLowerCase();
        const otherAge = otherProfile.ageGroup;

        if (myRole === otherRole) continue;
        if (myAge !== otherAge) continue;

        if (myEmotion !== otherEmotion) continue;

        foundUser = {
          id: docSnap.id,
          userId: data.userId
        };

        break;
      }

      if (foundUser) {
        await deleteDoc(doc(db, "waitingUsers", foundUser.id)).catch(() => {});
        await deleteDoc(doc(db, "waitingUsers", currentUser.uid)).catch(() => {});

        const chatRef = await addDoc(collection(db, "randomChats"), {
          users: [currentUser.uid, foundUser.userId],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          status: "active"
        });

        setSelectedUser({
          chatId: chatRef.id,
          uid: foundUser.userId
        });

        setLoading(false);

      } else {
        await setDoc(doc(db, "waitingUsers", currentUser.uid), {
          userId: currentUser.uid,
          createdAt: serverTimestamp()
        });
      }

    } catch (err) {
      console.error("Matching Error:", err);
      setLoading(false);
    }
  };

  /* ========================= */
  /* 🔥 BACK BUTTON (NEW LOGIC) */

  const handleBackToStart = async () => {
    if (!currentUser) return;

    try {
      if (selectedUser?.chatId) {
        await updateDoc(doc(db, "randomChats", selectedUser.chatId), {
          status: "ended",
          endedAt: serverTimestamp(),
          endedBy: currentUser.uid
        });
      }

      await deleteDoc(doc(db, "waitingUsers", currentUser.uid)).catch(() => {});

      setSelectedUser(null);
      setLoading(false);

    } catch (err) {
      console.error("Back Error:", err);
    }
  };

  /* 🔥 GLOBAL ACCESS (IMPORTANT) */
  useEffect(() => {
    window.handleRandomBack = handleBackToStart;
  }, [selectedUser]);

  /* ========================= */
  /* 🔥 NEXT CHAT */

  const handleNextChat = async () => {
    if (!currentUser) return;

    try {
      if (selectedUser?.chatId) {
        await updateDoc(doc(db, "randomChats", selectedUser.chatId), {
          status: "ended",
          endedAt: serverTimestamp(),
          endedBy: currentUser.uid
        });
      }

      await deleteDoc(doc(db, "waitingUsers", currentUser.uid)).catch(() => {});

      setSelectedUser(null);
      setLoading(true);
      setWaitMessage("Connecting you to someone new...");

      await startMatching();

    } catch (err) {
      console.error("Next Chat Error:", err);
    }
  };

  /* ========================= */
  /* 🔥 REALTIME LISTENER */

useEffect(() => {
  if (!currentUser) return;

  const q = query(
    collection(db, "randomChats"),
    where("users", "array-contains", currentUser.uid)
  );

  const unsub = onSnapshot(q, (snapshot) => {
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();

      if (data?.status === "ended") return;

      // 🔥 IMPORTANT FIX
      if (selectedUser) return;

      setSelectedUser({
        chatId: docSnap.id,
        uid: data.users.find((u) => u !== currentUser.uid)
      });

      setLoading(false);
    });
  });

  return () => unsub();
}, [currentUser, selectedUser]);

  /* ========================= */
  /* 🔥 WAIT TEXT */

  useEffect(() => {
    if (!loading) return;

    const t1 = setTimeout(() => {
      setWaitMessage("Please wait... we're connecting you 💙");
    }, 10000);

    const t2 = setTimeout(() => {
      setWaitMessage("Still searching... good things take time ✨");
    }, 30000);

    const t3 = setTimeout(() => {
      setWaitMessage("Relax, we’re still finding someone 😊");
    }, 60000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [loading]);

  /* ========================= */
  /* UI */

return (
  <div className="random-page">

    {/* 🔥 LEFT SIDE - CHAT LIST */}
    <div className="random-sidebar">
      <RandomChatList
        selectedId={selectedUser?.chatId}
        onSelect={handleSelectChat}
      />
    </div>

    {/* 🔥 RIGHT SIDE */}
    <div className="random-main">

      {!selectedUser && !loading && (
        <div className="random-start">
          <h2>Start a Random Chat</h2>
          <p>Talk to someone anonymously and feel better 💙</p>

          <button onClick={startMatching}>
            Find Someone
          </button>
        </div>
      )}

      {loading && (
        <div className="random-loading">
          <div className="loader"></div>
          <h3>{waitMessage}</h3>
        </div>
      )}

      {selectedUser && !loading && (
        <div className="chat-wrapper full-chat">
          <RandomChatWindow
            key={selectedUser.chatId}
            selectedUser={selectedUser}
            onNextChat={handleNextChat}
          />
        </div>
      )}

    </div>
  </div>
);
}