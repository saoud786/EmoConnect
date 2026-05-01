import React, { useState } from "react";
import "./QuickRelief.css";
import { Play, X } from "lucide-react";

export default function QuickRelief() {

  const exercises = [
    {
      name: "Deep Breathing",
      desc: "Inhale slowly for 4 sec, hold 4 sec, exhale 4 sec.",
      img: "/relief/breath.png",
    },
    {
      name: "Neck Stretch",
      desc: "Gently move your neck left and right.",
      img: "/relief/neck.png",
    },
    {
      name: "Shoulder Roll",
      desc: "Roll your shoulders forward and backward.",
      img: "/relief/shoulder.png",
    },
    {
      name: "Eye Relax",
      desc: "Close your eyes for 10 seconds and relax.",
      img: "/relief/eye.png",
    },
    {
      name: "Hand Relax",
      desc: "Clench and release your fists slowly.",
      img: "/relief/hand.png",
    },
  ];

  const [active, setActive] = useState(0);

  // 🔥 IMAGE MODAL STATE
  const [showImage, setShowImage] = useState(false);

  const nextExercise = () => {
    setActive((prev) => (prev + 1) % exercises.length);
  };

  return (
    <div className="relief-container">

      <div className="relief-content">

        {/* TITLE */}
        <h2 className="relief-title">Quick Stress Relief 💚</h2>

        {/* IMAGE (CLICKABLE) */}
        <div className="relief-image">
          <img
            src={exercises[active].img}
            alt={exercises[active].name}
            onClick={() => setShowImage(true)} // 🔥 OPEN MODAL
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>

        {/* NAME */}
        <h3 className="relief-name">
          {exercises[active].name}
        </h3>

        {/* DESCRIPTION */}
        <p className="relief-desc">
          {exercises[active].desc}
        </p>

        {/* NEXT BUTTON */}
        <button className="relief-btn" onClick={nextExercise}>
          <Play size={16} />
          Next Exercise
        </button>

        {/* LIST */}
        <div className="relief-list">
          {exercises.map((item, index) => (
            <button
              key={index}
              className={`relief-item ${active === index ? "active" : ""}`}
              onClick={() => setActive(index)}
            >
              {item.name}
            </button>
          ))}
        </div>

        {/* FOOTER */}
        <p className="relief-text">
          Take a moment to relax your body and mind 💚
        </p>

      </div>

      {/* 🔥 IMAGE MODAL */}
      {showImage && (
        <div className="relief-modal" onClick={() => setShowImage(false)}>

          <div
            className="relief-modal-box"
            onClick={(e) => e.stopPropagation()}
          >

            {/* CLOSE BUTTON */}
            <button
              className="relief-close"
              onClick={() => setShowImage(false)}
            >
              <X size={18} />
            </button>

            {/* IMAGE */}
            <img
              src={exercises[active].img}
              alt="Preview"
              className="relief-modal-img"
            />

            {/* TITLE */}
            <h4>{exercises[active].name}</h4>

          </div>

        </div>
      )}

    </div>
  );
}