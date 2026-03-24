// src/components/Chat/Chat.jsx

import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import AddUser from "./AddUser";
import Requests from "./Requests";
import EmoAI from "../EmoAI/EmoAI";

import { auth, db } from "../../Firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

import "./Chat.css";

export default function Chat() {

  const [view, setView] = useState("chat");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);


  /* MOBILE SCREEN DETECT */

  useEffect(() => {

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };

  }, []);



  /* USER PRESENCE SYSTEM */

  useEffect(() => {

    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);

    // User ONLINE
    updateDoc(userRef, {
      online: true,
      lastSeen: serverTimestamp()
    });

    const setOffline = async () => {

      try {

        await updateDoc(userRef, {
          online: false,
          lastSeen: serverTimestamp()
        });

      } catch (err) {
        console.error("Presence update error:", err);
      }

    };

    // Tab close detect
    window.addEventListener("beforeunload", setOffline);

    return () => {
      setOffline();
      window.removeEventListener("beforeunload", setOffline);
    };

  }, []);



  return (

    <div className="chat-layout">

      {/* SIDEBAR */}
      {(!isMobile || (!selectedUser && view !== "ai")) && (
        <Sidebar view={view} setView={setView} />
      )}


      <div className="chat-main">

        {/* CHAT LIST */}
        {((isMobile && view === "chat" && !selectedUser) || !isMobile) && (
          <ChatList
            selectedUser={selectedUser}
            setSelectedUser={(user) => {
              setSelectedUser(user);
              setView("chat");
            }}
          />
        )}


        {/* CHAT WINDOW */}
        {view === "chat" && (
          <ChatWindow
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
          />
        )}


        {/* OTHER VIEWS */}
        {view === "addUser" && <AddUser />}
        {view === "requests" && <Requests />}
        {view === "ai" && <EmoAI setView={setView} />}

      </div>

    </div>

  );

}