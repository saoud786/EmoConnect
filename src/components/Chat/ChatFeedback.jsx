// src/components/Chat/ChatFeedback.jsx

import React, { useState } from "react";
import { db, auth } from "../../Firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import "./ChatFeedback.css";

export default function ChatFeedback({ chatId, onClose }) {

  const [feeling, setFeeling] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const submitFeedback = async () => {

    if (!feeling) {
      alert("Please select how you feel.");
      return;
    }

    const user = auth.currentUser;

    if (!user) {
      alert("User not logged in.");
      return;
    }

    try {

      setLoading(true);

      await addDoc(collection(db, "chatReviews"), {

        chatId: chatId,

        userId: user.uid,

        reviewBy: user.displayName || "Anonymous",

        email: user.email || "No Email",

        feelingAfter: feeling,

        comment: comment.trim(),

        createdAt: serverTimestamp()

      });

      // close popup after submit
      onClose();

    } catch (err) {

      console.error("Feedback error:", err);
      alert("Something went wrong while submitting feedback.");

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="feedback-overlay">

      <div className="feedback-box">

        <h3>How do you feel after this chat?</h3>

        <div className="feedback-options">

          <button
            className={`muchBetter ${feeling === "much_better" ? "active" : ""}`}
            onClick={() => setFeeling("much_better")}
          >
            😊 Much Better
          </button>

          <button
            className={`better ${feeling === "better" ? "active" : ""}`}
            onClick={() => setFeeling("better")}
          >
            🙂 Better
          </button>

          <button
            className={`same ${feeling === "same" ? "active" : ""}`}
            onClick={() => setFeeling("same")}
          >
            😐 Same
          </button>

          <button
            className={`anxious ${feeling === "anxious" ? "active" : ""}`}
            onClick={() => setFeeling("anxious")}
          >
            😟 Still Anxious
          </button>

          <button
            className={`worse ${feeling === "worse" ? "active" : ""}`}
            onClick={() => setFeeling("worse")}
          >
            😢 Worse
          </button>

        </div>

        <textarea
          placeholder="Optional feedback..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <div className="feedback-actions">

          <button onClick={onClose}>
            Cancel
          </button>

          <button
            onClick={submitFeedback}
            disabled={!feeling || loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>

        </div>

      </div>

    </div>

  );

}