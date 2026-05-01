import React from "react";
import { useNavigate } from "react-router-dom";

import { HiOutlineMail } from "react-icons/hi";
import { FiMic, FiHeadphones, FiUserPlus } from "react-icons/fi";

import "./Signup.css";

const SignupOptions = () => {
  const navigate = useNavigate();

  // 🔥 HANDLE ROLE SELECT
  const handleSignup = (role) => {
    navigate("/signupEmail", {
      state: {
        role: role,
      },
    });
  };

  return (
    <div className="signup-container">

      {/* 🔝 HEADER */}
      <div className="signup-header">
        <div className="header-left">
          <div className="header-icon">
            <FiUserPlus />
          </div>

          <h1 className="title">Create Account</h1>
        </div>

        <p className="subtitle">
          Choose how you want to use EmoConnect
        </p>
      </div>

      {/* 🔲 ROLE GRID */}
      <div className="role-grid">

        {/* 🎤 SPEAKER */}
        <div className="role-card speaker">

          <div className="role-top">
            <div className="role-icon speaker-icon">
              <FiMic />
            </div>

            <h3>Speaker</h3>
          </div>

          <p className="role-desc">
            Share your feelings, anxiety, stress, or personal struggles.
            Connect with someone who listens without judgment.
          </p>

          <button
            onClick={() => handleSignup("speaker")}
            className="primary-btn"
          >
            <HiOutlineMail /> Continue as Speaker
          </button>

        </div>

        {/* 🎧 LISTENER */}
        <div className="role-card listener">

          <div className="role-top">
            <div className="role-icon listener-icon">
              <FiHeadphones />
            </div>

            <h3>Listener</h3>
          </div>

          <p className="role-desc">
            Help others by listening to their problems and emotions.
            Make someone feel heard and understood.
          </p>

          <button
            onClick={() => handleSignup("listener")}
            className="primary-btn secondary"
          >
            <HiOutlineMail /> Continue as Listener
          </button>

        </div>

      </div>

    </div>
  );
};

export default SignupOptions;