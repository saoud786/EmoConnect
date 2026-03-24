import React from "react";
import { Link } from "react-router-dom";
import "./ReadMore.css";

import {
  Lock,
  User,
  MessageCircle,
  Shield,
  Globe,
  BarChart3
} from "lucide-react";

const ReadMore = () => {
  return (
    <main className="about-page">

      <div className="about-container">

        <h1 className="about-title">About ChatApp</h1>

        <p className="about-subtitle">
          ChatApp is a secure anonymous real-time chat platform designed for
          privacy, accessibility, and modern communication.
        </p>

        {/* FEATURES */}
        <div className="section-heading">
          <h2>Main Features</h2>
        </div>

        <div className="features-grid">

          <div className="feature-card">
            <div className="feature-icon">
              <Lock size={22}/>
            </div>
            <h3>Secure Authentication</h3>
            <p>Email & Phone login using Firebase with identity protection.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <User size={22}/>
            </div>
            <h3>Anonymous Identity</h3>
            <p>Random usernames and avatars are generated after signup.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <MessageCircle size={22}/>
            </div>
            <h3>Real-Time Messaging</h3>
            <p>Instant chat sync using Firebase Firestore database.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Shield size={22}/>
            </div>
            <h3>AI Smart Moderation</h3>
            <p>Detect spam, abusive messages, and provide smart replies.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Globe size={22}/>
            </div>
            <h3>Translation + Voice</h3>
            <p>Voice-to-text and multilingual chat support for users.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <BarChart3 size={22}/>
            </div>
            <h3>Admin Dashboard</h3>
            <p>Monitor users, reports, analytics, and manage the platform.</p>
          </div>

        </div>

        {/* HOW IT WORKS */}

        <div className="section-heading">
          <h2>How It Works</h2>
        </div>

        <div className="steps">

          <div className="step">
            <span className="step-number">1</span>
            <p>Sign up with Email or Phone</p>
          </div>

          <div className="step">
            <span className="step-number">2</span>
            <p>Get an anonymous username automatically</p>
          </div>

          <div className="step">
            <span className="step-number">3</span>
            <p>Start chatting securely in real time</p>
          </div>

        </div>

        {/* BUTTONS */}

        <div className="about-buttons">

          <Link to="/" className="btn-outline">
            Back Home
          </Link>

          <Link to="/signup" className="btn-fill">
            Create Account
          </Link>

        </div>

      </div>

      {/* FOOTER */}

      <footer className="site-footer">

        <div className="footer-inner">

          <div>
            <p>© {new Date().getFullYear()} ChatApp</p>
            <p className="muted">
              Built with privacy and speed in mind.
            </p>
          </div>

          <div>
            <p>
              Contact:{" "}
              <a href="mailto:hello@chatapp.example">
                hello@chatapp.example
              </a>
            </p>

            <p>
              Phone: <a href="tel:+911234567890">+91 12345 67890</a>
            </p>
          </div>

        </div>

      </footer>

    </main>
  );
};

export default ReadMore;