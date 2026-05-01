// src/components/Chat/ChatNavbar.jsx

import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../../Firebase";
import { doc, onSnapshot } from "firebase/firestore";

import { ThemeContext } from "../Theme/ThemeContext.jsx";
import Requests from "./Requests"; // ✅ NEW

import {
  User,
  Pencil,
  Moon,
  Sun,
  LogOut,
  MoreVertical,
  MessageCircle,
  Bell
} from "lucide-react";

import "./ChatNavbar.css";

export default function ChatNavbar() {

  const navigate = useNavigate();
  const location = useLocation();

  const { theme, toggleTheme } = useContext(ThemeContext);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const [photoURL, setPhotoURL] = useState("");
  const [logoAnimate, setLogoAnimate] = useState(false);

  // ✅ Requests toggle
  const [showRequests, setShowRequests] = useState(false);
  const bellRef = useRef(null);

  // ✅ Support Modal
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportText, setSupportText] = useState("");

  /* =========================
     Logout
  ========================= */
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  /* =========================
     Avatar Listener
  ========================= */
  useEffect(() => {
    if (!auth.currentUser) return;

    const unsubscribe = onSnapshot(
      doc(db, "users", auth.currentUser.uid),
      (snapshot) => {
        if (snapshot.exists()) {
          setPhotoURL(snapshot.data().photoURL || "");
        }
      }
    );

    return () => unsubscribe();
  }, []);

  /* =========================
     Outside Click
  ========================= */
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }

      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setShowRequests(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () =>
      document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const isProfilePage = location.pathname === "/profile";

  return (
    <>
      <nav className="chat-navbar">

        {/* LEFT */}
        <div className="left-section">

          <div
            className={`chat-logo ${logoAnimate ? "animate" : ""}`}
            onClick={() => {
              setLogoAnimate(true);
              setTimeout(() => {
                setLogoAnimate(false);
                navigate("/chat");
              }, 700);
            }}
          >
            <img src="/logo.png" alt="logo" className="logo-img" />
            <span className="logo-text">EmoConnect</span>
          </div>

        </div>

        {/* RIGHT */}
        <div className="chat-actions">

          {/* 🔔 REQUEST ICON */}
          <div className="bell-wrapper" ref={bellRef}>
  <button
    className={`icon-btn ${showRequests ? "active" : ""}`}
    onClick={() => setShowRequests(!showRequests)}
  >
    <Bell size={20} />
    <span className="bell-dot"></span> {/* optional glow dot */}
  </button>

  {showRequests && (
    <Requests onClose={() => setShowRequests(false)} />
  )}
</div>

          {/* Avatar */}
          <Link
            to="/profile"
            className={`profile-icon-btn ${
              isProfilePage ? "active-avatar" : ""
            }`}
          >
            <img
              src={
                photoURL ||
                "https://ui-avatars.com/api/?name=User&background=60a5fa&color=fff"
              }
              alt="User Avatar"
              className="navbar-avatar"
            />
          </Link>

          {/* MENU */}
          <div className="menu-wrapper" ref={menuRef}>
            <button
              className="menu-btn"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <MoreVertical size={20}/>
            </button>

            {menuOpen && (
              <div className="dropdown-menu">

                <button onClick={() => {
                  navigate("/profile");
                  setMenuOpen(false);
                }}>
                  <User size={18}/>
                  <span>My Profile</span>
                </button>

                <button onClick={() => {
                  navigate("/profile-setup");
                  setMenuOpen(false);
                }}>
                  <Pencil size={18}/>
                  <span>Edit Profile</span>
                </button>

                <button onClick={() => {
                  toggleTheme();
                  setMenuOpen(false);
                }}>
                  {theme === "light" ? (
                    <>
                      <Moon size={18}/>
                      <span>Enable Dark Mode</span>
                    </>
                  ) : (
                    <>
                      <Sun size={18}/>
                      <span>Enable Light Mode</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setShowSupportModal(true);
                    setMenuOpen(false);
                  }}
                >
                  <MessageCircle size={18}/>
                  <span>Contact Admin</span>
                </button>

                <hr/>

                <button
                  className="logout-item"
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                >
                  <LogOut size={18}/>
                  <span>Logout</span>
                </button>

              </div>
            )}
          </div>

        </div>
      </nav>

      {/* SUPPORT MODAL */}
      {showSupportModal && (
        <div className="support-overlay">
          <div className="support-box">

            <h3>Contact Admin</h3>

            <textarea
              placeholder="Explain your issue..."
              value={supportText}
              onChange={(e) => setSupportText(e.target.value)}
            />

            <div className="support-actions">

              <button
                className="support-send"
                onClick={() => {
                  if (!supportText.trim()) {
                    alert("Please explain your issue");
                    return;
                  }

                  alert("Request sent ✅");
                  setSupportText("");
                  setShowSupportModal(false);
                }}
              >
                Send Request
              </button>

              <button
                className="support-cancel"
                onClick={() => setShowSupportModal(false)}
              >
                Cancel
              </button>

            </div>

          </div>
        </div>
      )}
    </>
  );
}