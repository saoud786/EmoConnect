// src/components/Chat/ChatList.jsx

import React, { useEffect, useState } from "react";
import {
  doc,
  onSnapshot,
  getDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";

import { auth, db } from "../../Firebase";
import { getChatId } from "../../utils/chatid";

import "./ChatList.css";

export default function ChatList({ setSelectedUser, selectedUser }) {
  const [chatUsers, setChatUsers] = useState([]);
  const [activeUid, setActiveUid] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [selectedChats, setSelectedChats] = useState([]);
  const [chatMeta, setChatMeta] = useState({});

  const currentUid = auth.currentUser?.uid;

  /* ======================================
     LOAD USERS FROM CONNECTIONS
  ====================================== */
  useEffect(() => {
    if (!currentUid) return;

    const unsub = onSnapshot(
      doc(db, "userConnections", currentUid),
      async (snapshot) => {
        if (!snapshot.exists()) {
          setChatUsers([]);
          return;
        }

        const connections = snapshot.data().connections || [];
        const usersData = [];

        for (let uid of connections) {
          try {
            const userDoc = await getDoc(doc(db, "users", uid));
            if (!userDoc.exists()) continue;

            const userData = userDoc.data();
            usersData.push(userData);

            const chatId = getChatId(currentUid, uid);

            /* 🔥 Listen to last message */
            const messagesRef = collection(
              db,
              "chats",
              chatId,
              "messages"
            );

            const q = query(
              messagesRef,
              orderBy("createdAt", "desc"),
              limit(1)
            );

            onSnapshot(q, (snap) => {
              if (!snap.empty) {
                const lastMsg = snap.docs[0].data();

                setChatMeta((prev) => ({
                  ...prev,
                  [uid]: {
                    ...prev[uid],
                    lastMsg,
                  },
                }));
              }
            });

            /* 🔥 Listen to unread count */
            onSnapshot(doc(db, "chats", chatId), (chatSnap) => {
              if (chatSnap.exists()) {
                const chatData = chatSnap.data();

                setChatMeta((prev) => ({
                  ...prev,
                  [uid]: {
                    ...prev[uid],
                    unreadCount:
                      chatData.unreadCount?.[currentUid] || 0,
                  },
                }));
              }
            });
          } catch (error) {
            console.error("User fetch error:", error);
          }
        }

        setChatUsers(usersData);
      }
    );

    return () => unsub();
  }, [currentUid]);

  /* ======================================
     DELETE SELECTED CHATS
  ====================================== */
  const deleteSelectedChats = async () => {
    if (!window.confirm("Delete selected chats?")) return;

    try {
      for (let uid of selectedChats) {
        const chatId = getChatId(currentUid, uid);

        const messagesRef = collection(db, "chats", chatId, "messages");
        const snapshot = await getDocs(messagesRef);

        for (const messageDoc of snapshot.docs) {
          await deleteDoc(messageDoc.ref);
        }

        await deleteDoc(doc(db, "chats", chatId));
      }

      setEditMode(false);
      setSelectedChats([]);
      setSelectedUser(null);
      setActiveUid(null);
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const toggleSelect = (uid) => {
    setSelectedChats((prev) =>
      prev.includes(uid)
        ? prev.filter((id) => id !== uid)
        : [...prev, uid]
    );
  };

  return (
    <section className="chat-list">
      {/* HEADER */}
      <div className="chat-list-header">
        <h3>Chats</h3>

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

      {chatUsers.length === 0 && <p>No chats yet</p>}

      {/* CHAT USERS */}
      {chatUsers.map((user) => {
        const meta = chatMeta[user.uid] || {};
        const lastMsg = meta.lastMsg;
        const unreadCount = meta.unreadCount || 0;

        const displayName =
          user.userId ||
          user.anonymousName ||
          user.email?.split("@")[0];

        const profileImage =
          user.photoURL || user.profilePic;

        return (
          <div
            key={user.uid}
            className={`chat-user ${
              activeUid === user.uid ? "active" : ""
            }`}
            onClick={() => {
              if (!editMode) {
                setSelectedUser(user);
                setActiveUid(user.uid);
              } else {
                toggleSelect(user.uid);
              }
            }}
          >
            {/* CHECKBOX */}
            {editMode && (
              <input
                type="checkbox"
                checked={selectedChats.includes(user.uid)}
                onChange={() => toggleSelect(user.uid)}
                onClick={(e) => e.stopPropagation()}
                className="select-checkbox"
              />
            )}

            {/* PROFILE IMAGE */}
            <div className="chat-avatar">
              {profileImage ? (
                <img src={profileImage} alt="profile" />
              ) : (
                <div className="avatar-placeholder">
                  {displayName?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* USER INFO */}
            <div className="chat-user-info">
              <p>{displayName}</p>

              <span>
                {lastMsg
                  ? lastMsg.senderId === currentUid
                    ? `You: ${lastMsg.text || "Media"}`
                    : lastMsg.text || "Media"
                  : "Tap to start chat"}
              </span>
            </div>

            {/* 🔥 UNREAD BADGE */}
            {unreadCount > 0 && (
              <div className="unread-badge">
                {unreadCount > 9 ? "9+" : unreadCount}
              </div>
            )}
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
    </section>
  );
}