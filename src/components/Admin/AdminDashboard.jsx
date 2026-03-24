import React, { useEffect, useState } from "react";
import { db } from "../../Firebase";
import "./AdminDashboard.css";

import { User, Mail, Clock, MessageCircle, Smile } from "lucide-react";

import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  getDoc,
  updateDoc,
  limit,
  deleteDoc,
  where,
  getDocs
} from "firebase/firestore";

export default function AdminDashboard() {

  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState("reports");
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState("all");
  const [reportFilter, setReportFilter] = useState("all");
  const [supportRequests, setSupportRequests] = useState([]);

  const [supportFilter, setSupportFilter] = useState("all");
  const [users, setUsers] = useState([]);

  const pendingSupportCount = supportRequests.filter(
    r => r.status !== "resolved"
  ).length;

  const unreadCount = reviews.filter(r => !r.read).length;
  const readCount = reviews.filter(r => r.read).length;

  // Support tab counts
  const unreadSupportCount = supportRequests.filter(req => req.status !== "resolved").length;
  const readSupportCount = supportRequests.filter(req => req.status === "resolved").length;

  /* ===============================
     LOAD SUPPORT REQUESTS
  ================================ */

  useEffect(() => {
    const q = query(
      collection(db, "supportRequests"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, async (snapshot) => {
      const data = await Promise.all(
        snapshot.docs.map(async (d) => {
          const req = d.data();
          const userSnap = await getDoc(doc(db, "users", req.userId));
          return {
            id: d.id,
            ...req,
            user: userSnap.exists() ? userSnap.data() : null
          };
        })
      );
      setSupportRequests(data);
    });
    return () => unsub();
  }, []);

  const markAsRead = async (id, currentStatus) => {
    try {
      await updateDoc(doc(db, "chatReviews", id), {
        read: !currentStatus
      });
    } catch (err) {
      console.error("Error updating read status:", err);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Loading...";
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  /* ===============================
     LOAD CHAT FEEDBACK
  =============================== */

  useEffect(() => {
    const q = query(
      collection(db, "chatReviews"),
      orderBy("createdAt", "desc"),
      limit(30)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReviews(data);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "users"));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(data);
    });
    return () => unsub();
  }, []);

  /* ===============================
     LOAD FLAGGED MESSAGES
  =============================== */

  useEffect(() => {
    const q = query(
      collection(db, "flaggedMessages"),
      orderBy("createdAt", "desc"),
      limit(50)
    );
    const unsub = onSnapshot(q, async (snapshot) => {
      const data = await Promise.all(
        snapshot.docs.map(async (d) => {
          const msg = d.data();
          const userSnap = await getDoc(doc(db, "users", msg.senderId));
          return {
            id: d.id,
            ...msg,
            user: userSnap.exists() ? userSnap.data() : null
          };
        })
      );
      const userMap = {};
      data.forEach((msg) => {
        if (!userMap[msg.senderId]) {
          userMap[msg.senderId] = {
            ...msg,
            words: [...(msg.words || [])]
          };
        } else {
          userMap[msg.senderId].words = [
            ...userMap[msg.senderId].words,
            ...(msg.words || [])
          ].slice(0, 5);
        }
      });
      setMessages(Object.values(userMap));
    });
    return () => unsub();
  }, []);

  /* ===============================
     DEACTIVATE USER
  =============================== */

  const deactivateUser = async (uid) => {
    try {
      await updateDoc(doc(db, "users", uid), {
        active: false
      });
      setMessages(prev =>
        prev.map(msg =>
          msg.senderId === uid
            ? { ...msg, user: { ...msg.user, active: false } }
            : msg
        )
      );
    } catch (err) {
      console.error("Deactivate error:", err);
    }
  };

  /* ===============================
     ACTIVATE USER
  ================================ */

  const activateUser = async (uid) => {
    try {
      await updateDoc(doc(db, "users", uid), {
        active: true,
        warnings: 0
      });
      const q = query(
        collection(db, "flaggedMessages"),
        where("senderId", "==", uid)
      );
      const snap = await getDocs(q);
      snap.forEach(async (d) => {
        await deleteDoc(doc(db, "flaggedMessages", d.id));
      });
      setMessages(prev => prev.filter(msg => msg.senderId !== uid));
    } catch (err) {
      console.error("Activate error:", err);
    }
  };

  /* ===============================
     MARK SUPPORT REQUEST RESOLVED
  ================================ */

  const markResolved = async (id) => {
    try {
      await updateDoc(doc(db, "supportRequests", id), {
        status: "resolved"
      });
    } catch (err) {
      console.error("Resolve error:", err);
    }
  };

  return (
    <div className="admin-page">
      {/* HEADER */}
      <div className="admin-header">
        <div className="admin-title">
          <h1>🛡 Admin Dashboard</h1>
          <p>Real-time monitoring of abusive conversations</p>
        </div>
        <div className="admin-tabs">
          <button
            className={view === "reports" ? "tab active" : "tab"}
            onClick={() => setView("reports")}
          >
            Reports
            {messages.length > 0 && (
              <span className="admin-badge">{messages.length}</span>
            )}
          </button>
          <button
            className={view === "feedback" ? "tab active" : "tab"}
            onClick={() => setView("feedback")}
          >
            Feedback
            {unreadCount > 0 && (
              <span className="admin-badge">{unreadCount}</span>
            )}
          </button>
          <button
            className={view === "support" ? "tab active" : "tab"}
            onClick={() => setView("support")}
          >
            Support
            {pendingSupportCount > 0 && (
              <span className="admin-badge">{pendingSupportCount}</span>
            )}
          </button>
        </div>
        <div className="admin-search">
          <input
            type="text"
            placeholder="Search by email or username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* ===============================
         REPORTS TAB (UPDATED)
      =============================== */}

      {view === "reports" && (
        <div className="admin-messages">
          <div className="report-filters">
            <button
              className={reportFilter === "all" ? "active" : ""}
              onClick={() => setReportFilter("all")}
            >
              All ({users.length})
            </button>
            <button
              className={reportFilter === "active" ? "active" : ""}
              onClick={() => setReportFilter("active")}
            >
              Active ({users.filter(u => u.active !== false).length})
            </button>
            <button
              className={reportFilter === "blocked" ? "active" : ""}
              onClick={() => setReportFilter("blocked")}
            >
              Blocked ({users.filter(u => u.active === false).length})
            </button>
          </div>

          {(() => {
            // Map flagged messages by senderId
            const flaggedMap = {};
            messages.forEach(msg => {
              flaggedMap[msg.senderId] = msg;
            });

            let itemsToDisplay = [];

            // For All, show all users (both active and blocked)
            if (reportFilter === "all") {
              itemsToDisplay = users.map(user => {
                const flagged = flaggedMap[user.id] || {};
                return {
                  ...flagged,
                  id: flagged.id || user.id,
                  senderId: user.id,
                  user: user,
                  words: flagged.words || [],
                  createdAt: flagged.createdAt || null,
                  text: flagged.text || null,
                };
              });
            } else if (reportFilter === "active") {
              // Show only active users
              const activeUsers = users.filter(u => u.active !== false);
              itemsToDisplay = activeUsers.map(user => {
                const flagged = flaggedMap[user.id] || {};
                return {
                  ...flagged,
                  id: flagged.id || user.id,
                  senderId: user.id,
                  user: user,
                  words: flagged.words || [],
                  createdAt: flagged.createdAt || null,
                  text: flagged.text || null,
                };
              });
            } else if (reportFilter === "blocked") {
              // Show only blocked users
              const blockedUsers = users.filter(u => u.active === false);
              itemsToDisplay = blockedUsers.map(user => {
                const flagged = flaggedMap[user.id] || {};
                return {
                  ...flagged,
                  id: flagged.id || user.id,
                  senderId: user.id,
                  user: user,
                  words: flagged.words || [],
                  createdAt: flagged.createdAt || null,
                  text: flagged.text || null,
                };
              });
            }

            // Apply search filter
            const filteredItems = itemsToDisplay.filter(item => {
              const name = item.user?.anonymousName || "";
              const email = item.user?.email || "";
              return (
                name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                email.toLowerCase().includes(searchTerm.toLowerCase())
              );
            });

            if (filteredItems.length === 0) {
              return <div className="empty-state">No users found</div>;
            }

            return filteredItems.map(msg => (
              <div key={msg.id} className="message-card">
                <div className="user-row">
                  <div>
                    <div className="user-name">
                      {msg.user?.anonymousName || msg.user?.email || "Unknown User"}
                    </div>
                    <div className="user-email">
                      {msg.user?.email}
                    </div>
                  </div>
                  <div className="user-status">
                    {msg.user?.active === false
                      ? <span className="status-banned">Deactivated</span>
                      : <span className="status-active">Active</span>
                    }
                  </div>
                </div>

                <div className="message-box">
                  <div className="feedback-date">
                    <Clock size={14} />
                    {formatDate(msg.createdAt)}
                  </div>
                  <div className="message-label">
                    Support Request
                  </div>
                  <div className="message-text">
                    {msg.text || "No message"}
                  </div>
                </div>

                <div className="detected-list">
                  {msg.words?.map((word, i) => (
                    <span key={i} className="detected-badge">
                      {word}
                    </span>
                  ))}
                </div>

                <div className="admin-actions">
                  <button
                    className="deactivate-btn"
                    disabled={msg.user?.active === false}
                    onClick={() => deactivateUser(msg.senderId)}
                  >
                    Deactivate
                  </button>
                  <button
                    className="activate-btn"
                    disabled={msg.user?.active === true}
                    onClick={() => activateUser(msg.senderId)}
                  >
                    Activate
                  </button>
                </div>
              </div>
            ));
          })()}
        </div>
      )}

      {/* ===============================
         FEEDBACK TAB (unchanged)
      =============================== */}

      {view === "feedback" && (
        <div className="admin-feedback">
          <div className="feedback-filters">
            <button
              className={filter === "all" ? "active" : ""}
              onClick={() => setFilter("all")}
            >
              All ({reviews.length})
            </button>
            <button
              className={filter === "unread" ? "active" : ""}
              onClick={() => setFilter("unread")}
            >
              Unread
              {unreadCount > 0 && (
                <span className="unread-badge">{unreadCount}</span>
              )}
            </button>
            <button
              className={filter === "read" ? "active" : ""}
              onClick={() => setFilter("read")}
            >
              Read ({readCount})
            </button>
          </div>

          {reviews.length === 0 && (
            <div className="empty-state">No feedback yet</div>
          )}

          {reviews
            .filter((r) => {
              if (filter === "read") return r.read;
              if (filter === "unread") return !r.read;
              return true;
            })
            .map((r) => (
              <div key={r.id} className="feedback-card">
                <div className="feedback-left">
                  <div className="feedback-user">
                    <User size={16} />
                    {r.reviewBy || "Anonymous"}
                  </div>
                  <div className="feedback-email">
                    <Mail size={15} />
                    {r.email || "No Email"}
                  </div>
                  {r.comment && (
                    <div className="feedback-comment">
                      <MessageCircle size={14} />
                      {r.comment}
                    </div>
                  )}
                </div>
                <div className="feedback-right">
                  <div className={`feedback-feeling feeling-${r.feelingAfter}`}>
                    <Smile size={14} />
                    {r.feelingAfter}
                  </div>
                  <div className="feedback-date">
                    <Clock size={14} />
                    {formatDate(r.createdAt)}
                  </div>
                  <div className="feedback-read">
                    <label>
                      <input
                        type="checkbox"
                        checked={r.read || false}
                        onChange={() => markAsRead(r.id, r.read)}
                      />
                      Mark as read
                    </label>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* ===============================
         SUPPORT TAB (UPDATED with counts)
      =============================== */}

      {view === "support" && (
        <div className="admin-messages">
          <div className="feedback-filters">
            <button
              className={supportFilter === "all" ? "active" : ""}
              onClick={() => setSupportFilter("all")}
            >
              All ({supportRequests.length})
            </button>
            <button
              className={supportFilter === "unread" ? "active" : ""}
              onClick={() => setSupportFilter("unread")}
            >
              Unread
              {unreadSupportCount > 0 && (
                <span className="unread-badge">{unreadSupportCount}</span>
              )}
            </button>
            <button
              className={supportFilter === "read" ? "active" : ""}
              onClick={() => setSupportFilter("read")}
            >
              Read ({readSupportCount})
            </button>
          </div>
          {supportRequests.length === 0 && (
            <div className="empty-state">No support requests</div>
          )}
          {supportRequests
            .filter((req) => {
              if (supportFilter === "read") return req.status === "resolved";
              if (supportFilter === "unread") return req.status !== "resolved";
              return true;
            })
            .map((req) => (
              <div key={req.id} className="message-card">
                <div className="user-row">
                  <div>
                    <div className="user-name">
                      {req.user?.anonymousName || req.user?.email || "User"}
                    </div>
                    <div className="user-email">
                      {req.user?.email}
                    </div>
                  </div>
                  <div className="support-time">
                    <Clock size={14} />
                    {formatDate(req.createdAt)}
                  </div>
                </div>
                <div className="message-box">
                  <div className="message-label">
                    Support Request
                  </div>
                  <div className="message-text">
                    {req.message || "No message"}
                  </div>
                  <div className="admin-actions">
                    {req.status !== "resolved" ? (
                      <button
                        className="activate-btn"
                        onClick={() => markResolved(req.id)}
                      >
                        Mark Resolved
                      </button>
                    ) : (
                      <span className="status-active">✔ Resolved</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}