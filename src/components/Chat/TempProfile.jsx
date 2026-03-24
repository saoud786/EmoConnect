import React from "react";
import "./TempProfile.css";

export default function UserProfileModal({ user, onClose }) {
  if (!user) return null;

  // ✅ Safe Display Name
  const displayName =
    user.name?.trim() ||
    user.userId?.trim() ||
    user.anonymousName?.trim() ||
    user.email?.split("@")[0] ||
    "User";

  return (
    <div className="profile-overlay" onClick={onClose}>
      <div
        className="profile-card"
        onClick={(e) => e.stopPropagation()} // ✅ Prevent close when clicking inside
      >
        <button className="close-btn" onClick={onClose}>
          ✖
        </button>

      <div className="profile-avatar">
  {user.photoURL ? (
    <img src={user.photoURL} alt="profile" />
  ) : (
    displayName[0].toUpperCase()
  )}
</div>

        <h2>{displayName}</h2>

        <div className="profile-info">
          <p>
            <strong>Email:</strong>{" "}
            {user.email || "Not available"}
          </p>

          <p>
            <strong>Gender:</strong>{" "}
            {user.gender || "Not set"}
          </p>

          <p>
            <strong>Emoji:</strong>{" "}
            {user.emoji || "-"}
          </p>
        </div>
      </div>
    </div>
  );
}