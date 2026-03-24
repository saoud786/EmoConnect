// src/components/Profile/ProfileSetup.jsx

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { auth, db } from "../../Firebase";

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import Cropper from "react-easy-crop";
import "./ProfileSetup.css";

/* ---------------- CONSTANTS ---------------- */
const DEFAULT_AVATAR =
  "https://api.dicebear.com/8.x/thumbs/svg?seed=chatapp_final&scale=85";

const FALLBACK_AVATAR =
  "https://ui-avatars.com/api/?name=User&background=60a5fa&color=fff";

const EMOJI_LIST = ["😄", "🔥", "👑", "😎", "🤖", "🎧", "🌟", "💫"];

/* ---------------- HELPERS ---------------- */
async function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function cropToBlob(imageSrc, cropPixels) {
  const image = await loadImage(imageSrc);

  const canvas = document.createElement("canvas");
  canvas.width = cropPixels.width;
  canvas.height = cropPixels.height;

  const ctx = canvas.getContext("2d");

  ctx.drawImage(
    image,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    cropPixels.width,
    cropPixels.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.95);
  });
}

/* Username Validation */
function validateUserId(id) {
  return /^[a-z0-9_]{3,20}$/.test(id);
}

/* ---------------- EMOJI PICKER ---------------- */
function EmojiPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (!boxRef.current?.contains(e.target)) setOpen(false);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <div className="ps-emoji-picker" ref={boxRef}>
      <button
        type="button"
        className="ps-emoji-button"
        onClick={() => setOpen(!open)}
      >
        {value || "None"} <span>▾</span>
      </button>

      {open && (
        <div className="ps-emoji-grid">
          <button
            className="ps-emoji-cell"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
          >
            None
          </button>

          {EMOJI_LIST.map((emo, i) => (
            <button
              key={i}
              className="ps-emoji-cell"
              onClick={() => {
                onChange(emo);
                setOpen(false);
              }}
            >
              {emo}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- MAIN COMPONENT ---------------- */
export default function ProfileSetup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [gender, setGender] = useState("other");
  const [emoji, setEmoji] = useState("");

  const [userId, setUserId] = useState("");
  const [usernameStatus, setUsernameStatus] = useState("");

  const [preview, setPreview] = useState(DEFAULT_AVATAR);
  const [finalFile, setFinalFile] = useState(null);

  /* Modals */
  const [showPreview, setShowPreview] = useState(false);
  const [cropModal, setCropModal] = useState(false);

  /* Crop */
  const [tempImage, setTempImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropPixels, setCropPixels] = useState(null);

  const [saving, setSaving] = useState(false);

  /* ---------------- LOAD PROFILE DATA ---------------- */
  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/login");
      return;
    }

    const loadProfile = async () => {
      const snap = await getDoc(doc(db, "users", auth.currentUser.uid));

      if (snap.exists()) {
        const data = snap.data();

        // ✅ Load already saved values
        setName(data.name || "");
        setGender(data.gender || "other");
        setEmoji(data.emoji || "");
        setUserId(data.userId || "");

        if (data.photoURL) {
          setPreview(data.photoURL);
        }
      }
    };

    loadProfile();
  }, [navigate]);

  /* ---------------- USERNAME CHECK ---------------- */
  useEffect(() => {
    if (!userId) return setUsernameStatus("");

    if (!validateUserId(userId)) return setUsernameStatus("invalid");

    const timer = setTimeout(async () => {
      const q = query(collection(db, "users"), where("userId", "==", userId));
      const snap = await getDocs(q);

      const duplicate = snap.docs.some(
        (docSnap) => docSnap.id !== auth.currentUser.uid
      );

      setUsernameStatus(duplicate ? "taken" : "available");
    }, 500);

    return () => clearTimeout(timer);
  }, [userId]);

  /* ---------------- FILE INPUT ---------------- */
  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setTempImage(reader.result);
      setCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  /* ---------------- CROP COMPLETE ---------------- */
  const onCropComplete = useCallback((_, pixels) => {
    setCropPixels(pixels);
  }, []);

  /* ---------------- APPLY CROP ---------------- */
  const applyCrop = async () => {
    if (!cropPixels) return alert("Crop not ready!");

    const blob = await cropToBlob(tempImage, cropPixels);

    const file = new File([blob], `avatar_${Date.now()}.jpg`, {
      type: "image/jpeg",
    });

    setFinalFile(file);
    setPreview(URL.createObjectURL(file));
    setCropModal(false);
  };

  /* ---------------- CLOUDINARY UPLOAD ---------------- */
  async function uploadAvatar() {
    if (!finalFile) return preview;

    const formData = new FormData();
    formData.append("file", finalFile);
    formData.append("upload_preset", "Emoconnect");

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/djh1sgui1/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      return data.secure_url;
    } catch (err) {
      console.error("Cloudinary Upload Failed:", err);
      return preview;
    }
  }

  /* ---------------- SAVE PROFILE ---------------- */
  const saveProfile = async () => {
    if (usernameStatus !== "available") {
      return alert("Choose valid & available username!");
    }

    setSaving(true);

    try {
      const uid = auth.currentUser.uid;

      const photoURL = await uploadAvatar();

      await setDoc(
        doc(db, "users", uid),
        {
          uid,
          userId,
          name,
          gender,
          emoji,
          photoURL,
          updatedAt: serverTimestamp(),
          profileComplete: true,
        },
        { merge: true }
      );

      alert("Profile Saved Successfully ✅");
      navigate("/chat");
    } catch (err) {
      console.error("Save Error:", err);
      alert("Profile Save Failed ❌");
    }

    setSaving(false);
  };

  return (
    <div className="ps-container">
      <div className="ps-card">
        {/* Avatar */}
        <div className="ps-header">
          <div
            className="ps-avatar-wrap"
            onClick={() => setShowPreview(true)}
          >
            <img
              src={preview}
              alt="avatar"
              onError={(e) => (e.target.src = FALLBACK_AVATAR)}
            />
            <div className="ps-avatar-overlay">👁 View</div>
          </div>

          <label className="ps-edit-btn">
            Edit Photo
            <input type="file" accept="image/*" onChange={handleFileInput} />
          </label>

          <h2>Profile Setup ✨</h2>
        </div>

        {/* Form */}
        <div className="ps-form">
          {/* Username */}
          <div className="ps-field">
            <label className="ps-label">Username *</label>
            <input
              className="ps-input"
              value={userId}
              onChange={(e) =>
                setUserId(
                  e.target.value
                    .toLowerCase()
                    .replace(/\s+/g, "_")
                    .replace(/[^a-z0-9_]/g, "")
                )
              }
              placeholder="example: saoud_35"
            />
          </div>

          <p className="ps-userid-help">
            {usernameStatus === "invalid" &&
              "Only lowercase letters, numbers, underscore (3–20 chars)."}
            {usernameStatus === "taken" && "Username already taken ❌"}
            {usernameStatus === "available" && "Username available ✔"}
          </p>

          {/* Name */}
          <div className="ps-field">
            <label className="ps-label">Name</label>
            <input
              className="ps-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Optional"
            />
          </div>

          {/* Gender */}
          <div className="ps-field">
            <label className="ps-label">Gender</label>
            <select
              className="ps-input"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="other">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          {/* Emoji */}
          <div className="ps-field">
            <label className="ps-label">Emoji</label>
            <EmojiPicker value={emoji} onChange={setEmoji} />
          </div>

          {/* Save */}
          <div className="ps-actions">
            <button className="ps-btn ps-save" onClick={saveProfile}>
              {saving ? "Saving..." : "Save & Continue"}
            </button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div
          className="ps-preview-modal"
          onClick={() => setShowPreview(false)}
        >
          <div className="ps-preview-box">
            <img src={preview} alt="preview" />
          </div>
        </div>
      )}

      {/* Crop Modal */}
      {cropModal && (
        <div className="ps-modal">
          <div className="ps-modal-box">
            <h3>Crop Avatar</h3>

            <div className="ps-crop-area">
              <Cropper
                image={tempImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                onCropChange={setCrop}
                onZoomChange={(z) => setZoom(Number(z))}
                onCropComplete={onCropComplete}
              />
            </div>

            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
            />

            <div className="ps-actions">
              <button className="ps-btn ps-save" onClick={applyCrop}>
                Apply
              </button>

              <button
                className="ps-btn ps-skip"
                onClick={() => setCropModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
