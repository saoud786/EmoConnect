import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../Firebase";
import { doc, getDoc } from "firebase/firestore";

const AdminProtectedRoute = ({ children }) => {

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, async (user) => {

      if (!user) {
        setLoading(false);
        return;
      }

      try {

        const snap = await getDoc(doc(db, "users", user.uid));
        const data = snap.data();

        if (snap.exists() && data?.role === "admin") {
          setIsAdmin(true);
        }

      } catch (error) {
        console.error("Admin check error:", error);
      }

      setLoading(false);

    });

    return () => unsubscribe();

  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "150px" }}>
        <h2>Checking Admin Access...</h2>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/chat" replace />;
  }

  return children;

};

export default AdminProtectedRoute;