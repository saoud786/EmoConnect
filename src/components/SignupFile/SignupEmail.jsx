import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";

// ✅ Firestore
import { doc, setDoc } from "firebase/firestore";

import { auth, db } from "../../Firebase";
import { useNavigate, useLocation, Link } from "react-router-dom";

import { MdEmail } from "react-icons/md";
import { FiLock, FiMic, FiHeadphones } from "react-icons/fi"; // ✅ ICONS FIXED
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

import "./SignupEmail.css";

const SignupEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const role = location.state?.role || "speaker";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      alert("Password must be at least 6 characters!");
      return;
    }

    try {
      setLoading(true);

      const res = await createUserWithEmailAndPassword(auth, email, password);

      const anonymousName = "User" + Math.floor(Math.random() * 10000);

      await setDoc(doc(db, "users", res.user.uid), {
        uid: res.user.uid,
        email: res.user.email,
        role: role,
        profileComplete: false,
        issues: [],
        anonymousName: anonymousName,
        createdAt: new Date(),
      });

      alert(`Account Created as ${role.toUpperCase()} 🎉`);

      navigate("/select-issues");

    } catch (error) {
      alert(error.message);
      console.log(error);
    }

    setLoading(false);
  };

  return (
    <div className="emailSignup-page">
      <div className="emailSignup-card">

        {/* 🔥 HEADER WITH CLEAN ICON */}
        <div className="signup-header-row">

          {/* ICON */}
          {role === "speaker" ? (
            <FiMic className="signup-role-icon" />
          ) : (
            <FiHeadphones className="signup-role-icon" />
          )}

          {/* TEXT */}
          <div>
            <h1 className="emailSignup-title">
              Signup as {role === "speaker" ? "Speaker" : "Listener"}
            </h1>

            <p className="emailSignup-subtitle">
              Create your EmoConnect account
            </p>
          </div>

        </div>

        <form onSubmit={handleSignup} className="emailSignup-form">

          {/* EMAIL */}
          <div className="field">
            <MdEmail className="field-icon" />
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="field password-field">
            <FiLock className="field-icon" />

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Create password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <span
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </span>
          </div>

          {/* BUTTON */}
          <button type="submit" className="emailSignup-btn" disabled={loading}>
            {loading
              ? "Creating..."
              : `Create ${role === "speaker" ? "Speaker" : "Listener"} Account`}
          </button>

        </form>

        <p className="emailSignup-footer">
          Back to <Link to="/signup">Signup Options</Link>
        </p>

      </div>
    </div>
  );
};

export default SignupEmail;