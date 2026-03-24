import React, { useState } from "react";
import "./MoodTag.css";

const moods = [
  { emoji: "😊", label: "Happy" },
  { emoji: "😢", label: "Sad" },
  { emoji: "😣", label: "Stressed" },
  { emoji: "😰", label: "Anxious" },
  { emoji: "🥺", label: "Lonely" },
  { emoji: "😡", label: "Angry" }
];

export default function MoodTag({ onSelect }) {

  const [selected, setSelected] = useState(null);

  const handleSelect = (mood) => {
    setSelected(mood.label);
    onSelect(mood);
  };

  return (
    <div className="mood-container">

      {moods.map((mood, i) => (
        <button
          key={i}
          className={`mood-btn ${selected === mood.label ? "active" : ""}`}
          onClick={() => handleSelect(mood)}
          title={mood.label}
        >
          {mood.emoji}
        </button>
      ))}

    </div>
  );
}