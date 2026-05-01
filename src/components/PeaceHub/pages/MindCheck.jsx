import React, { useState, useEffect } from "react";
import "./MindCheck.css";
import { Send, Trash2, ArrowLeft } from "lucide-react";

import { db, auth } from "../../../Firebase";

import {
  addDoc,
  collection,
  serverTimestamp,
  query,
  deleteDoc,
  doc,
  onSnapshot,
  where,
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";

export default function MindCheck() {

  const [mood, setMood] = useState("");
  const [week, setWeek] = useState("");
  const [improve, setImprove] = useState("");
  const [loading, setLoading] = useState(false);

  const [history, setHistory] = useState([]);

  // 🔥 NEW: VIEW TOGGLE
  const [showHistory, setShowHistory] = useState(false);

  /* ===============================
     SAVE
  =============================== */
  const handleSubmit = async () => {
    if (!mood || !week || !improve) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const user = auth.currentUser;
      if (!user) {
        alert("User not logged in");
        return;
      }

      await addDoc(collection(db, "mindChecks"), {
        userId: user.uid,
        mood,
        week,
        improve,
        createdAt: serverTimestamp(),
      });

      setMood("");
      setWeek("");
      setImprove("");

    } catch (error) {
      console.error(error);
      alert("Error saving data");
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     FETCH
  =============================== */
  useEffect(() => {
    let unsubscribeSnapshot;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setHistory([]);
        return;
      }

      const q = query(
        collection(db, "mindChecks"),
        where("userId", "==", user.uid)
      );

      unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        data.sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0;
          return b.createdAt.seconds - a.createdAt.seconds;
        });

        setHistory(data);
      });
    });

    return () => {
      if (unsubscribeSnapshot) unsubscribeSnapshot();
      unsubscribeAuth();
    };
  }, []);

  /* ===============================
     DELETE
  =============================== */
  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "mindChecks", id));
  };

  return (
    <div className="mind-container">
      <div className="mind-content">

        {/* ===============================
           🔵 HEADER (DYNAMIC)
        =============================== */}
        <div className="mind-header">

          {showHistory && (
            <button
              className="back-btn"
              onClick={() => setShowHistory(false)}
            >
              <ArrowLeft size={18} />
            </button>
          )}

          <h2 className="mind-title">
            {showHistory ? "Your Check-ins" : "Mind Check 💚"}
          </h2>
        </div>

        {/* ===============================
           🟢 FORM VIEW
        =============================== */}
        {!showHistory && (
          <>
            {/* MOOD */}
            <div className="mind-section">
              <p>How did you feel this week?</p>

              <div className="mind-options">
                {["😊 Happy", "😐 Neutral", "😔 Sad", "😣 Stressed"].map((m) => (
                  <button
                    key={m}
                    className={`mind-btn ${mood === m ? "active" : ""}`}
                    onClick={() => setMood(m)}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* WEEK */}
            <div className="mind-section">
              <p>How was your week?</p>
              <textarea
                value={week}
                onChange={(e) => setWeek(e.target.value)}
                placeholder="Write your thoughts..."
              />
            </div>

            {/* IMPROVE */}
            <div className="mind-section">
              <p>What do you want to improve?</p>
              <textarea
                value={improve}
                onChange={(e) => setImprove(e.target.value)}
                placeholder="Something you want to work on..."
              />
            </div>

            {/* SAVE */}
            <button className="mind-submit" onClick={handleSubmit}>
              <Send size={16} />
              {loading ? "Saving..." : "Save Check-In"}
            </button>

            {/* 🔥 VIEW BUTTON */}
            <button
              className="mind-view-btn"
              onClick={() => setShowHistory(true)}
            >
              View Your Check-ins →
            </button>
          </>
        )}

        {/* ===============================
           🔵 HISTORY VIEW
        =============================== */}
        {showHistory && (
          <div className="mind-history">

            {history.length === 0 ? (
              <p className="empty">No check-ins yet 💭</p>
            ) : (
              history.map((item) => (
                <div key={item.id} className="mind-card">

                  <div className="mind-card-top">
                    <span>{item.mood}</span>

                    <button onClick={() => handleDelete(item.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <p><strong>Week:</strong> {item.week}</p>
                  <p><strong>Improve:</strong> {item.improve}</p>

                  <small>
                    {item.createdAt
                      ? new Date(item.createdAt.seconds * 1000).toLocaleString()
                      : "Saving..."}
                  </small>

                </div>
              ))
            )}

          </div>
        )}

      </div>
    </div>
  );
}