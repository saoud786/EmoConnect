import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { X } from "lucide-react";

import { auth, db } from "../../Firebase";
import "./AddUser.css";

export default function AddUser() {
  const [search, setSearch] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const currentUid = auth.currentUser?.uid;

  /* ===============================
     SEARCH USER
  =============================== */
  const handleSearch = async () => {
    if (!search.trim()) return;

    try {
      const q = query(
        collection(db, "users"),
        where("userId", "==", search.trim())
      );

      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const user = snapshot.docs[0].data();

        if (user.uid === currentUid) {
          setMessage("You cannot add yourself.");
          setResult(null);
          return;
        }

        setResult(user);
        setMessage("");
      } else {
        setResult(null);
        setMessage("User not found.");
      }
    } catch (error) {
      console.error("Search error:", error);
      setMessage("Something went wrong.");
    }
  };

  /* ===============================
     SEND REQUEST
  =============================== */
  const sendRequest = async () => {
    if (!result) return;

    setLoading(true);

    try {
      const q = query(
        collection(db, "chatRequests"),
        where("from", "==", currentUid),
        where("to", "==", result.uid),
        where("status", "==", "pending")
      );

      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        setMessage("Request already sent.");
        setLoading(false);
        return;
      }

      await addDoc(collection(db, "chatRequests"), {
        from: currentUid,
        to: result.uid,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      setMessage(`Request sent to ${result.userId} successfully.`);
      setResult(null);
      setSearch("");
    } catch (error) {
      console.error("Send request error:", error);
      setMessage("Failed to send request.");
    }

    setLoading(false);
  };

  /* ===============================
     AUTO HIDE MESSAGE
  =============================== */
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="add-user-container">
      <h3>Add User</h3>

      {/* SEARCH FORM */}
      <form
        className="search-box"
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
      >
        <input
          type="text"
          placeholder="Enter userId..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button type="submit">
          Search
        </button>
      </form>

      {/* SEARCH RESULT */}
      {result && (
        <div className="search-result">
          <p>{result.userId}</p>

          <div className="result-actions">
            <button onClick={sendRequest} disabled={loading}>
              {loading ? "Sending..." : "Send Request"}
            </button>

            <button
              className="close-result-btn"
              type="button"
              onClick={() => setResult(null)}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* MESSAGE */}
      {message && (
        <div className="request-success">
          {message}
        </div>
      )}
    </div>
  );
}