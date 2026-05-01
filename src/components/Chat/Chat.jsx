import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import AddUser from "./AddUser";
import Requests from "./Requests";
import EmoAI from "../EmoAI/EmoAI";
import PeaceHub from "../PeaceHub/PeaceHub";

// 🔥 RANDOM
import RandomPage from "../Random/RandomPage";
import RandomChatList from "../Random/RandomChatList";

import { auth, db } from "../../Firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

import "./Chat.css";

export default function Chat() {
  const [view, setView] = useState("chat");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  /* 📱 MOBILE DETECT */
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* 🟢 USER PRESENCE */
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);

    updateDoc(userRef, {
      online: true,
      lastSeen: serverTimestamp(),
    });

    const setOffline = async () => {
      try {
        await updateDoc(userRef, {
          online: false,
          lastSeen: serverTimestamp(),
        });
      } catch (err) {
        console.error("Presence error:", err);
      }
    };

    window.addEventListener("beforeunload", setOffline);

    return () => {
      setOffline();
      window.removeEventListener("beforeunload", setOffline);
    };
  }, []);

  /* 💚 PEACE MODE (NAVBAR CONTROL) */
  useEffect(() => {
    if (view === "peace") {
      document.body.classList.add("peace-active");
    } else {
      document.body.classList.remove("peace-active");
    }

    return () => {
      document.body.classList.remove("peace-active");
    };
  }, [view]);

  const isRandom = view === "random";

  return (
    <div className="chat-layout">

      {/* 🔥 SIDEBAR */}
      <Sidebar view={view} setView={setView} />

      <div className="chat-main">

        {/* ================= RANDOM CHAT ================= */}
        {isRandom ? (
          <div className="random-layout">

            {/* LEFT */}
            {/* {((isMobile && !selectedUser) || !isMobile) && (
              <RandomChatList
                chats={[]}
                selectedId={null}
                onSelect={() => {}}
              />
            )} */}

            {/* RIGHT */}
            <div className="random-full">
              <RandomPage />
            </div>

          </div>
        ) : (
          <>
            {/* ================= CHAT LIST ================= */}
            {view !== "peace" &&
              ((isMobile && !selectedUser) || !isMobile) && (
                <ChatList
                  selectedUser={selectedUser}
                  setSelectedUser={(user) => {
                    setSelectedUser(user);
                    setView("chat");
                  }}
                />
              )
            }

            {/* ================= CHAT WINDOW ================= */}
            {view === "chat" && (
              <ChatWindow
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
              />
            )}

            {/* ================= OTHER ================= */}
            {view === "addUser" && <AddUser />}
            {view === "requests" && <Requests />}
            {view === "ai" && <EmoAI setView={setView} />}

            {/* 💚 PEACE HUB (BACK SUPPORT) */}
            {view === "peace" && <PeaceHub setView={setView} />}
          </>
        )}

      </div>
    </div>
  );
}