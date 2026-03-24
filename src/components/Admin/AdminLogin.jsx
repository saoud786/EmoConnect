import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../Firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import "./AdminLogin.css";

export default function AdminLogin() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    try {

      setLoading(true);

      // login with firebase auth
      const result = await signInWithEmailAndPassword(auth, email, password);

      // check user role from firestore
      const snap = await getDoc(doc(db, "users", result.user.uid));

      if (snap.exists() && snap.data().role === "admin") {

        navigate("/admin");

      } else {

        alert("❌ Access denied. You are not an admin.");

      }

    } catch (error) {

      console.error("Admin login error:", error);

      alert("Invalid admin credentials");

    } finally {

      setLoading(false);

    }
  };

  return (

    <div className="adminLoginPage">

      <div className="adminLoginCard">

        <h1>Admin Login</h1>
        <p>Access EmoConnect Admin Dashboard</p>

        <form onSubmit={handleAdminLogin}>

          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>

            {loading ? "Logging in..." : "Login as Admin"}

          </button>

        </form>

      </div>

    </div>

  );
}