import React from "react";
import { Link } from "react-router-dom";
import "./ReadMore.css";

import {
  Lock,
  User,
  MessageCircle,
  Shield,
  Globe,
  BarChart3,
  Zap,
  Heart,
  Bot
} from "lucide-react";

const ReadMore = () => {
  return (
    <main className="about-page">

      <div className="about-container">

        <h1 className="about-title">About EmoConnect</h1>

        <p className="about-subtitle">
          EmoConnect is a modern anonymous chat platform focused on mental well-being,
          real-time communication, and AI-powered support.
        </p>

        {/* FEATURES */}
        <div className="section-heading">
          <h2>Main Features</h2>
        </div>

        <div className="features-grid">

          {/* 1 */}
          <div className="feature-card">
            <div className="feature-icon"><Zap size={22}/></div>
            <h3>Random Anonymous Chat</h3>
            <p>Connect instantly with strangers and share emotions freely.</p>
          </div>

          {/* 2 */}
          <div className="feature-card">
            <div className="feature-icon"><MessageCircle size={22}/></div>
            <h3>Normal Chat System</h3>
            <p>Search users, send requests and chat like social apps.</p>
          </div>

          {/* 3 */}
          <div className="feature-card">
            <div className="feature-icon"><Heart size={22}/></div>
            <h3>Peace Hub</h3>
            <p>Meditation, breathing and relaxation tools for mental wellness.</p>
          </div>

          {/* 4 */}
          <div className="feature-card">
            <div className="feature-icon"><Bot size={22}/></div>
            <h3>AI Assistance</h3>
            <p>Smart emotional support and helpful AI-based responses.</p>
          </div>

          {/* 5 */}
          <div className="feature-card">
            <div className="feature-icon"><Shield size={22}/></div>
            <h3>Abuse Detection</h3>
            <p>Detect abusive words in chats and flag messages automatically.</p>
          </div>

          {/* 6 */}
          <div className="feature-card">
            <div className="feature-icon"><BarChart3 size={22}/></div>
            <h3>Admin Dashboard</h3>
            <p>Admin can monitor chats, view flagged users and take action.</p>
          </div>

          {/* 7 */}
          <div className="feature-card">
            <div className="feature-icon"><Lock size={22}/></div>
            <h3>Secure Authentication</h3>
            <p>Firebase-based login with secure user authentication.</p>
          </div>

          {/* 8 */}
          <div className="feature-card">
            <div className="feature-icon"><User size={22}/></div>
            <h3>Anonymous Identity</h3>
            <p>Users stay anonymous with random identity generation.</p>
          </div>

          {/* 9 */}
          <div className="feature-card">
            <div className="feature-icon"><Globe size={22}/></div>
            <h3>Real-Time System</h3>
            <p>Instant chat updates powered by Firebase Firestore.</p>
          </div>

        </div>

        {/* HOW IT WORKS */}
        <div className="section-heading">
          <h2>How It Works</h2>
        </div>

        <div className="steps">

          <div className="step">
            <span className="step-number">1</span>
            <p>Sign up and get anonymous identity</p>
          </div>

          <div className="step">
            <span className="step-number">2</span>
            <p>Start random or normal chat</p>
          </div>

          <div className="step">
            <span className="step-number">3</span>
            <p>AI + system monitors abuse and ensures safety</p>
          </div>

          <div className="step">
            <span className="step-number">4</span>
            <p>Admin can block/unblock users if misuse detected</p>
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
            <p>© {new Date().getFullYear()} EmoConnect</p>
            <p className="muted">
              Built for emotional support and safe communication.
            </p>
          </div>

          <div>
            <p>
              Contact:{" "}
              <a href="mailto:hello@emoconnect.app">
                hello@emoconnect.app
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