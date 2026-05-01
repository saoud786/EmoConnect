import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "firebase/auth";

import { auth, db } from "../../Firebase";
import { doc, getDoc } from "firebase/firestore";

import { useNavigate, Link } from "react-router-dom";

import { MdEmail } from "react-icons/md";
import { FiLock } from "react-icons/fi";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

import "./Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("speaker");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  // 🔥 FORGOT PASSWORD STATE
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  /* ========================= */
  /* 🔥 REDIRECT */
  const redirectUser = async (user) => {
    try {
      const snap = await getDoc(doc(db, "users", user.uid));

      if (!snap.exists()) {
        navigate("/select-issues");
        return;
      }

      const data = snap.data();

      if (data.role !== mode) {
        showToast(`You are registered as ${data.role}`);
        return;
      }

      if (!data.issues || data.issues.length === 0) {
        navigate("/select-issues");
        return;
      }

      if (!data.profileComplete) {
        navigate("/profile-setup");
        return;
      }

      navigate("/chat");

    } catch (err) {
      console.error(err);
      navigate("/");
    }
  };

  /* ========================= */
  /* 🔥 LOGIN */
  const handleLogin = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      showToast("Password must be at least 6 characters!");
      return;
    }

    setLoading(true);

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);

      showToast("Login Successful 🎉");

      setTimeout(() => {
        redirectUser(result.user);
      }, 800);

    } catch {
      showToast("Invalid Email or Password ❌");
    }

    setLoading(false);
  };

  /* ========================= */
  /* 🔥 RESET PASSWORD */
  const handleResetPassword = async () => {
    if (!resetEmail) {
      showToast("Enter your email 📧");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      showToast("Reset link sent ✅");
      setShowForgot(false);
      setResetEmail("");
    } catch (err) {
      console.error(err);
      showToast("Error sending email ❌");
    }
  };

  return (
    <div className="loginPage">
      <div className="loginCard">

        {/* TABS */}
        <div className="loginTabs">
          <button
            className={mode === "speaker" ? "active" : ""}
            onClick={() => setMode("speaker")}
          >
            🗣️ Speaker Login
          </button>

          <button
            className={mode === "listener" ? "active" : ""}
            onClick={() => setMode("listener")}
          >
            👂 Listener Login
          </button>
        </div>

        {/* TITLE */}
        <h1 className="loginTitle">
          {mode === "speaker" ? "Login as Speaker" : "Login as Listener"}
        </h1>

        <p className="loginSubtitle">
          Secure access to your EmoConnect account
        </p>

        {/* FORM */}
        <form onSubmit={handleLogin} className="loginForm">

          {/* EMAIL */}
          <div className="inputBox">
            <MdEmail className="inputIcon" />
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="inputBox">
            <FiLock className="inputIcon" />

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <span
              className="eyeBtn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </span>
          </div>

          {/* 🔥 FORGOT PASSWORD */}
          <p className="forgotPassword" onClick={() => setShowForgot(true)}>
            Forgot Password?
          </p>

          {/* BUTTON */}
          <button className="loginBtn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        {/* FOOTER */}
        <p className="loginFooter">
          <Link to="/signup">Create Account</Link> ·{" "}
          <Link to="/readmore">About</Link>
        </p>

      </div>

      {/* 🔥 MODAL */}
    {/* 🔥 FORGOT PASSWORD MODAL */}
{showForgot && (
  <div className="forgotOverlay">

    <div className="forgotModal">

      <button
        className="closeBtn"
        onClick={() => setShowForgot(false)}
      >
        ✕
      </button>

      <h2>Reset Password</h2>

      <p className="forgotSub">
        Enter your email and we'll send you a reset link
      </p>

      <input
        type="email"
        placeholder="Enter your email"
        value={resetEmail}
        onChange={(e) => setResetEmail(e.target.value)}
        className="forgotInput"
      />

      <button
        className="sendBtn"
        onClick={handleResetPassword}
      >
        Send Reset Link
      </button>

    </div>

  </div>
)}

      {/* TOAST */}
      {toast && <div className="toastBox">{toast}</div>}
    </div>
  );
}