import React, { useEffect, useState } from "react";
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

export default function Requests() {
  const [requests, setRequests] = useState([]);

  const currentUid = auth.currentUser?.uid;

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

  const acceptRequest = async (requestDoc) => {
    try {
      const data = requestDoc.data();

      // ✅ Update request status
      await updateDoc(requestDoc.ref, {
        status: "accepted",
      });

      // ✅ Ensure current userConnections exists
      const currentRef = doc(db, "userConnections", currentUid);
      const currentSnap = await getDoc(currentRef);

      if (!currentSnap.exists()) {
        await setDoc(currentRef, { connections: [] });
      }

      // ✅ Ensure sender userConnections exists
      const senderRef = doc(db, "userConnections", data.from);
      const senderSnap = await getDoc(senderRef);

      if (!senderSnap.exists()) {
        await setDoc(senderRef, { connections: [] });
      }

      // ✅ Add both users to connections
      await updateDoc(currentRef, {
        connections: arrayUnion(data.from),
      });

      await updateDoc(senderRef, {
        connections: arrayUnion(currentUid),
      });

    } catch (error) {
      console.error("Accept Error:", error);
      alert("Failed to accept request ❌");
    }
  };

  return (
    <div style={{ width: "280px", padding: "30px 20px" }}>
      <h3>Requests</h3>

      {requests.length === 0 && <p>No requests</p>}

      {requests.map((req) => (
        <div key={req.id} style={{ marginBottom: "15px" }}>
          <p>{req.data().from}</p>

          <button onClick={() => acceptRequest(req)}>
            Accept
          </button>
        </div>
      ))}
    </div>
  );
}