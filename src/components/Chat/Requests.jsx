import React, { useEffect, useState, useRef } from "react";
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

import { auth, db } from "../../Firebase";
import { X } from "lucide-react";

import "./Requests.css";

export default function Requests({ onClose }) {
  const [requests, setRequests] = useState([]);
  const [requestUsers, setRequestUsers] = useState({});

  const dropdownRef = useRef(null);
  const currentUid = auth.currentUser?.uid;

  /* ===============================
     LISTEN REQUESTS
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
     FETCH USERS
  =============================== */
  useEffect(() => {
    const fetchUsers = async () => {
      const usersData = {};

      for (const req of requests) {
        const data = req.data();
        const userSnap = await getDoc(doc(db, "users", data.from));

        if (userSnap.exists()) {
          usersData[data.from] = userSnap.data();
        }
      }

      setRequestUsers(usersData);
    };

    if (requests.length > 0) fetchUsers();
    else setRequestUsers({});
  }, [requests]);

  /* ===============================
     OUTSIDE CLICK
  =============================== */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        onClose && onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  /* ===============================
     ACCEPT
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

    } catch (error) {
      console.error("Accept Error:", error);
    }
  };

  /* ===============================
     REJECT
  =============================== */
  const rejectRequest = async (requestDoc) => {
    await updateDoc(requestDoc.ref, {
      status: "rejected",
    });
  };

  return (
    <div className="request-dropdown" ref={dropdownRef}>

      {/* HEADER */}
      <div className="request-header">
        <h4>Requests ({requests.length})</h4>

        <button
          className="request-close-btn"
          onClick={onClose}
        >
          <X size={18} />
        </button>
      </div>

      {/* EMPTY STATE */}
      {requests.length === 0 && (
        <div className="no-req">No requests</div>
      )}

      {/* LIST */}
      {requests.map((req) => {
        const data = req.data();
        const user = requestUsers[data.from];

        const name =
          user?.userId ||
          user?.anonymousName ||
          user?.email?.split("@")[0];

        return (
          <div key={req.id} className="request-item">

            <div className="request-info">
              <div>{name}</div>
              <small>Sent request</small>
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
  );
}