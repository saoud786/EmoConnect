import React, { useEffect, useState } from "react";
import { auth, db } from "../../Firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import "./Profile.css";

export default function Profile() {
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Modal State
  const [showModal, setShowModal] = useState(false);

  // ✅ Load Profile Data
  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const snap = await getDoc(
          doc(db, "users", auth.currentUser.uid)
        );

        if (snap.exists()) {
          setUserData(snap.data());
        }
      } catch (err) {
        console.log("Profile Fetch Error:", err);
      }

      setLoading(false);
    };

    fetchProfile();
  }, [navigate]);

  // ✅ Loading UI
  if (loading) {
    return <h2 className="profile-loading">Loading Profile...</h2>;
  }

  // ✅ No Profile Found
  if (!userData) {
    return (
      <div className="profile-error">
        <h2>No Profile Found ❌</h2>
        <button onClick={() => navigate("/profile-setup")}>
          Setup Profile
        </button>
      </div>
    );
  }

  // ✅ Fix Gender Text
  const genderText =
    userData.gender === "male"
      ? "Male"
      : userData.gender === "female"
      ? "Female"
      : "Prefer not to say";

  // ✅ Fix Avatar
  const avatar =
    userData.photoURL ||
    "https://ui-avatars.com/api/?name=User&background=60a5fa&color=fff";

  return (
    <div className="profile-page">
      {/* ✅ Profile Card */}
      <div className="profile-card">
        {/* Avatar Section */}
        <div
          className="profile-avatar-box"
          onClick={() => setShowModal(true)}
        >
          <img src={avatar} alt="avatar" />
          <span className="profile-hover-text">View</span>
        </div>

        {/* Name + Username */}
        <h2>{userData.name || "Anonymous User"}</h2>
        <p className="profile-username">@{userData.userId}</p>

        {/* Emoji */}
        {userData.emoji && (
          <div className="profile-emoji">{userData.emoji}</div>
        )}

        {/* Details */}
        <div className="profile-details">
          <div className="profile-row">
            <span>Gender</span>
            <b>{genderText}</b>
          </div>

          <div className="profile-row">
            <span>Status</span>
            <b className="status-green">
              {userData.profileComplete
                ? "Completed ✅"
                : "Incomplete ❌"}
            </b>
          </div>
        </div>

        {/* Buttons */}
        <div className="profile-actions">
          <button
            className="btn-edit"
            onClick={() => navigate("/profile-setup")}
          >
            ✏ Edit Profile
          </button>

          <button
            className="btn-back"
            onClick={() => navigate("/chat")}
          >
            ⬅ Back to Chat
          </button>
        </div>
      </div>

      {/* ✅ Modal Preview */}
      {showModal && (
        <div
          className="profile-modal"
          onClick={() => setShowModal(false)}
        >
          <div className="modal-box">
            <img src={avatar} alt="Full View" />
          </div>
        </div>
      )}
    </div>
  );
}
