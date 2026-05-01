import React, { useState, useEffect } from "react";
import { auth, db } from "../../Firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import "./IssueSelection.css";

const ISSUES = [
  "General talk", // 🔥 NEW (special option)
  "Anxiety",
  "Family Problem",
  "Stress",
  "Depression",
  "Relationship",
  "Loneliness",
  "Career",
  "Low Confidence",
];

const AGE_GROUPS = [
  "18-25",
  "26-30",
  "31-40",
  "41-50",
  "51-60",
  "60-70",
  "70+",
];

export default function IssueSelection() {
  const navigate = useNavigate();

  const [role, setRole] = useState("speaker");
  const [selected, setSelected] = useState([]);
  const [selectedAge, setSelectedAge] = useState("");

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  /* ============================ */
  /* 🔥 LOAD USER DATA */
  useEffect(() => {
    const load = async () => {
      const uid = auth.currentUser?.uid;

      if (!uid) {
        navigate("/login");
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", uid));

        if (snap.exists()) {
          const data = snap.data();

          setRole(data.role || "speaker");

          if (data.issues) setSelected(data.issues);
          if (data.ageGroup) setSelectedAge(data.ageGroup);
        }
      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, [navigate]);

  /* ============================ */
  /* 🔥 TOGGLE ISSUE */
const toggle = (item) => {
  setSelected([item]); // ✅ only one select allowed
};

  /* ============================ */
  /* 🔥 STEP 1 → NEXT */
  const handleNext = () => {
    if (selected.length === 0) {
      return alert("Please select an option or choose General talk");
    }

    setStep(2);
  };

  /* ============================ */
  /* 🔥 FINAL SAVE */
  const handleSave = async () => {
    if (!selectedAge) {
      return alert("Please select your age group");
    }

    setLoading(true);

    try {
      const uid = auth.currentUser.uid;

      await updateDoc(doc(db, "users", uid), {
        issues: selected,
        ageGroup: selectedAge,
      });

      navigate("/profile-setup");
    } catch (err) {
      console.error(err);
      alert("Error saving ❌");
    }

    setLoading(false);
  };

  return (
    <div className="issue-page">
      <div className="issue-card">

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <h1>
              {role === "speaker"
                ? "What are you struggling with?"
                : "What problems can you help with?"}
            </h1>

            <p className="subtitle">
              Select topics to get matched with the right people
            </p>

            <div className="issue-grid">
              {ISSUES.map((item, i) => (
                <button
                  key={i}
                  className={`issue-btn ${
                    selected.includes(item) ? "active" : ""
                  } ${item === "General talk" ? "general-talk" : ""}`}
                  onClick={() => toggle(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            <button className="save-btn" onClick={handleNext}>
              Next Step →
            </button>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <h1>Select your age group</h1>

            <p className="subtitle">
              This helps us match you better
            </p>

            <div className="issue-grid">
              {AGE_GROUPS.map((age, i) => (
                <button
                  key={i}
                  className={`issue-btn ${
                    selectedAge === age ? "active" : ""
                  }`}
                  onClick={() => setSelectedAge(age)}
                >
                  {age}
                </button>
              ))}
            </div>

            <button
              className="save-btn"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Saving..." : "Continue →"}
            </button>
          </>
        )}

      </div>
    </div>
  );
}