import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth, db } from "../../Firebase";
import { doc, getDoc } from "firebase/firestore";

export default function AdminRoute({ children }) {

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {

    const checkAdmin = async () => {

      const user = auth.currentUser;

      if (!user) {
        setLoading(false);
        return;
      }

      const snap = await getDoc(doc(db, "users", user.uid));

      if (snap.exists() && snap.data().role === "admin") {
        setIsAdmin(true);
      }

      setLoading(false);
    };

    checkAdmin();

  }, []);

  if (loading) return <div>Loading...</div>;

  if (!isAdmin) return <Navigate to="/chat" />;

  return children;
}