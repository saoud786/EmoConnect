// src/components/Chat/Sidebar.jsx

import React, { useState, useEffect, useRef } from "react";

import { auth, db } from "../../Firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  arrayUnion,
  setDoc,
  getDoc,
} from "firebase/firestore";

import {
  MessageCircle,
  UserPlus,
  Bell,
  Bot,
  X,
} from "lucide-react";

import "./Sidebar.css";

export default function Sidebar({ view, setView }) {
  const [showRequests, setShowRequests] = useState(false);
  const [requests, setRequests] = useState([]);
  const [requestUsers, setRequestUsers] = useState({});

  const dropdownRef = useRef(null);
  const currentUid = auth.currentUser?.uid;

  /* ===============================
     Listen for Pending Requests
  =============================== */
  useEffect(() => {
    if (!currentUid) return;

    const q = query(
      collection(db, "chatRequests"),
      where("to", "==", currentUid),
      where("status", "==", "pending")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setRequests(snapshot.docs);
    });

    return () => unsub();
  }, [currentUid]);

  /* ===============================
     Fetch Sender User Data
  =============================== */
  useEffect(() => {
    const fetchUsers = async () => {
      const usersData = {};

      for (const req of requests) {
        const data = req.data();
        const userRef = doc(db, "users", data.from);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          usersData[data.from] = userSnap.data();
        }
      }

      setRequestUsers(usersData);
    };

    if (requests.length > 0) {
      fetchUsers();
    } else {
      setRequestUsers({});
    }
  }, [requests]);

  /* ===============================
     Close Dropdown on Outside Click
  =============================== */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowRequests(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ===============================
     Accept Request
  =============================== */
  const acceptRequest = async (requestDoc) => {
    try {
      const data = requestDoc.data();

      await updateDoc(requestDoc.ref, {
        status: "accepted",
      });

      const currentRef = doc(db, "userConnections", currentUid);
      const senderRef = doc(db, "userConnections", data.from);

      const currentSnap = await getDoc(currentRef);
      const senderSnap = await getDoc(senderRef);

      if (!currentSnap.exists()) {
        await setDoc(currentRef, { connections: [] });
      }

      if (!senderSnap.exists()) {
        await setDoc(senderRef, { connections: [] });
      }

      await updateDoc(currentRef, {
        connections: arrayUnion(data.from),
      });

      await updateDoc(senderRef, {
        connections: arrayUnion(currentUid),
      });

      setShowRequests(false);
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  /* ===============================
     Reject Request
  =============================== */
  const rejectRequest = async (requestDoc) => {
    try {
      await updateDoc(requestDoc.ref, {
        status: "rejected",
      });
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  /* ===============================
     Change View
  =============================== */
  const handleViewChange = (newView) => {
    setView(newView);
    setShowRequests(false);
  };

  return (
    <div className="chat-sidebar">
      <div className="sidebar-icons">

        {/* CHAT */}
        <button
          className={`side-btn ${view === "chat" ? "active" : ""}`}
          onClick={() => handleViewChange("chat")}
        >
          <MessageCircle size={22} />
          <span className="tooltip">Chats</span>
        </button>

        {/* ADD USER */}
        <button
          className={`side-btn ${view === "addUser" ? "active" : ""}`}
          onClick={() => handleViewChange("addUser")}
        >
          <UserPlus size={22} />
          <span className="tooltip">Add User</span>
        </button>

        {/* REQUESTS */}
        <div className="bell-wrapper" ref={dropdownRef}>
          <button
            className={`side-btn ${showRequests ? "active" : ""}`}
            onClick={() => setShowRequests(!showRequests)}
          >
            <Bell size={22} />
            <span className="tooltip">Requests</span>
          </button>

          {requests.length > 0 && (
            <span className="notification-badge">
              {requests.length}
            </span>
          )}

          {showRequests && (
            <div className="request-dropdown">
            <div className="request-header">
  <button
    className="request-close-btn"
    onClick={() => setShowRequests(false)}
  >
    <X size={18} />
  </button>

  <h4>
    Requests {requests.length > 0 && `(${requests.length})`}
  </h4>
</div>

              {requests.length === 0 && (
                <p className="no-req">No requests</p>
              )}

              {requests.map((req) => {
                const data = req.data();
                const user = requestUsers[data.from];

                const displayName =
                  user?.name ||
                  user?.userId ||
                  user?.email?.split("@")[0] ||
                  "Unknown";

                const profileImage =
                  user?.photoURL || user?.profilePic;

                return (
                  <div key={req.id} className="request-item">

                    <div className="request-left">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt="profile"
                          className="request-avatar-img"
                        />
                      ) : (
                        <div className="request-avatar">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div className="request-info">
                        <div className="request-name">
                          {displayName}
                        </div>
                        <div className="request-sub">
                          Sent you a connection request
                        </div>
                      </div>
                    </div>

                    <div className="req-actions">
                      <button
                        className="accept-btn"
                        onClick={() => acceptRequest(req)}
                      >
                        Accept
                      </button>

                      <button
                        className="reject-btn"
                        onClick={() => rejectRequest(req)}
                      >
                        Reject
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* EMOAI */}
        <button
          className={`side-btn ${view === "ai" ? "active" : ""}`}
          onClick={() => handleViewChange("ai")}
        >
          <Bot size={22} />
          <span className="tooltip">EmoAI</span>
        </button>

      </div>
    </div>
  );
}