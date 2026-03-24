import React, { useState, useRef } from "react";
import {
  signInWithEmailAndPassword,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";

import { auth, db } from "../../Firebase";
import { doc, getDoc } from "firebase/firestore";

import { useNavigate, Link } from "react-router-dom";

import { MdEmail } from "react-icons/md";
import { FiLock, FiPhone } from "react-icons/fi";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

import "./Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("email");

  // Email Login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Show Password Toggle
  const [showPassword, setShowPassword] = useState(false);

  // Phone Login
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const [confirmationResult, setConfirmationResult] = useState(null);

  // UI
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const recaptchaRef = useRef(null);

  // Toast Helper
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  // ✅ Redirect After Login (Profile Check)
  const redirectUser = async (user) => {
    const snap = await getDoc(doc(db, "users", user.uid));

    if (snap.exists() && snap.data().profileComplete === true) {
      navigate("/chat"); // ✅ Profile Already Done
    } else {
      navigate("/profile-setup"); // ❌ First Time User
    }
  };

  // ✅ Email Login
  const handleEmailLogin = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      showToast("Password must be at least 6 characters!");
      return;
    }

    setLoading(true);

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);

      showToast("Login Successful 🎉");

      // ✅ Profile Check Redirect
      setTimeout(() => redirectUser(result.user), 800);
    } catch {
      showToast("Invalid Email or Password ❌");
    }

    setLoading(false);
  };

  // ✅ Setup Recaptcha
  const setupRecaptcha = () => {
    if (window.recaptchaVerifier) return;

    window.recaptchaVerifier = new RecaptchaVerifier(
      recaptchaRef.current,
      { size: "invisible" },
      auth
    );
  };

  // ✅ Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!phone.startsWith("+")) {
      showToast("Phone must include country code (+91...)");
      return;
    }

    setLoading(true);

    try {
      setupRecaptcha();

      const result = await signInWithPhoneNumber(
        auth,
        phone,
        window.recaptchaVerifier
      );

      setConfirmationResult(result);
      showToast("OTP Sent Successfully ✅");
    } catch {
      showToast("OTP Failed ❌ Try Again");
    }

    setLoading(false);
  };

  // ✅ Verify OTP Login
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!otp) {
      showToast("Enter OTP first!");
      return;
    }

    setLoading(true);

    try {
      const result = await confirmationResult.confirm(otp);

      showToast("Phone Login Successful 🎉");

      // ✅ Profile Check Redirect
      setTimeout(() => redirectUser(result.user), 800);
    } catch {
      showToast("Invalid OTP ❌");
    }

    setLoading(false);
  };

  return (
    <div className="loginPage">
      <div className="loginCard">
        {/* Tabs */}
        <div className="loginTabs">
          <button
            className={mode === "email" ? "active" : ""}
            onClick={() => {
              setMode("email");
              setConfirmationResult(null);
            }}
          >
            Email Login
          </button>

          <button
            className={mode === "phone" ? "active" : ""}
            onClick={() => {
              setMode("phone");
              setConfirmationResult(null);
            }}
          >
            Phone Login
          </button>
        </div>

        {/* Title */}
        <h1 className="loginTitle">
          {mode === "email" ? "Login with Email" : "Login with Phone"}
        </h1>

        <p className="loginSubtitle">
          Secure access to your EmoConnect account
        </p>

        {/* EMAIL LOGIN */}
        {mode === "email" && (
          <form onSubmit={handleEmailLogin} className="loginForm">
            {/* Email */}
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

            {/* Password */}
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
                {showPassword ? (
                  <AiOutlineEyeInvisible />
                ) : (
                  <AiOutlineEye />
                )}
              </span>
            </div>

            <button className="loginBtn" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        )}

        {/* PHONE LOGIN */}
        {mode === "phone" && (
          <>
            <div ref={recaptchaRef}></div>

            {!confirmationResult ? (
              <form onSubmit={handleSendOtp} className="loginForm">
                <div className="inputBox">
                  <FiPhone className="inputIcon" />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                <button className="loginBtn" disabled={loading}>
                  {loading ? "Sending OTP..." : "Send OTP"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="loginForm">
                <div className="inputBox">
                  <FiLock className="inputIcon" />
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </div>

                <button className="loginBtn" disabled={loading}>
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
              </form>
            )}
          </>
        )}

        {/* Footer */}
        <p className="loginFooter">
          <Link to="/signup">Create Account</Link> ·{" "}
          <Link to="/readmore">About</Link>
        </p>
      </div>

      {/* Toast */}
      {toast && <div className="toastBox">{toast}</div>}
    </div>
  );
}
