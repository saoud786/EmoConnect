import React, { useEffect, useState } from "react";
import "./RandomChatList.css";

import { db, auth } from "../../Firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  deleteDoc,
  doc,
  
} from "firebase/firestore";

export default function RandomChatList({ selectedId, onSelect }) {

  const [chats, setChats] = useState([]);
  const [activeId, setActiveId] = useState(null);

  const [editMode, setEditMode] = useState(false);
  const [selectedChats, setSelectedChats] = useState([]);

  /* ========================= */
  /* 🔥 LOAD RANDOM CHATS */
useEffect(() => {
  if (!auth.currentUser) return;

  const q = query(
    collection(db, "randomChats"),
    where("users", "array-contains", auth.currentUser.uid),
    where("isSaved", "==", true), // 🔥 sirf saved chats
    orderBy("createdAt", "desc")
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const chatList = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data()
    }));

    setChats(chatList);
  });

  return () => unsubscribe();
}, [auth.currentUser?.uid]);

  /* ========================= */
  /* 🔥 SELECT */

  const toggleSelect = (chatId) => {
    setSelectedChats((prev) =>
      prev.includes(chatId)
        ? prev.filter((id) => id !== chatId)
        : [...prev, chatId]
    );
  };

  /* ========================= */
  /* 🔥 DELETE */

  const deleteSelectedChats = async () => {
    if (!window.confirm("Delete selected chat?")) return;

    try {
      for (let id of selectedChats) {
        await deleteDoc(doc(db, "randomChats", id)); // ✅ FIXED
      }

      setSelectedChats([]);
      setEditMode(false);
      setActiveId(null);
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  /* ========================= */
  /* UI */

  return (
    <div className="random-list">

      {/* 🔝 HEADER */}
      <div className="random-list-header">

        <h2>Random Chats</h2>

        <div style={{ display: "flex", gap: "8px" }}>

          {/* 🔙 BACK BUTTON */}
       

          {/* ✏️ EDIT */}
          {!editMode ? (
            <button className="edit-btn" onClick={() => setEditMode(true)}>
              ✎
            </button>
          ) : (
            <button
              className="done-btn"
              onClick={() => {
                setEditMode(false);
                setSelectedChats([]);
              }}
            >
              Done
            </button>
          )}

        </div>
      </div>

      <p className="random-subtitle">
        Anonymous conversations
      </p>
   <button
            className="back-btn1"
            onClick={() => {
              if (window.handleRandomBack) {
                window.handleRandomBack();
              }
            }}
          >
            + Find Someone
          </button>
      {/* 📭 EMPTY */}
      {chats.length === 0 && (
        <div className="random-list-empty">
          <h3>No active chat</h3>
        </div>
      )}

      {/* 💬 CHAT LIST */}
      {chats.map((chat) => {

        const otherUser = chat.users?.find(
          (u) => u !== auth.currentUser.uid
        );

        return (
          <div
            key={chat.id}
            className={`random-chat-item ${
              activeId === chat.id ? "active" : ""
            }`}
            onClick={() => {
              if (!editMode) {
                  console.log("CLICKED:", chat.id);
                setActiveId(chat.id);

                onSelect &&
                  onSelect({
                    chatId: chat.id,
                    uid: otherUser
                  });
              } else {
                toggleSelect(chat.id);
              }
            }}
          >

            {/* CHECKBOX */}
            {editMode && (
              <input
                type="checkbox"
                checked={selectedChats.includes(chat.id)}
                onChange={() => toggleSelect(chat.id)}
                onClick={(e) => e.stopPropagation()}
                className="select-checkbox"
              />
            )}

            {/* AVATAR */}
            <div className="random-avatar">
              👤
            </div>

            {/* INFO */}
            <div className="random-info">
              <h4>Stranger</h4>
              <p>{chat.lastMessage || "Connected"}</p>
            </div>

          </div>
        );
      })}

      {/* DELETE BUTTON */}
      {editMode && selectedChats.length > 0 && (
        <button
          className="delete-selected-btn"
          onClick={deleteSelectedChats}
        >
          Delete Selected ({selectedChats.length})
        </button>
      )}
    </div>
  );
}