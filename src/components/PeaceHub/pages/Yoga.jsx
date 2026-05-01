import React, { useState } from "react";
import "./Yoga.css";

export default function Yoga() {

  const poses = [
    {
      name: "Mountain Pose",
      desc: "Stand tall, keep your body straight and relaxed.",
      img: "/yoga/mountain.png",
    },
    {
      name: "Tree Pose",
      desc: "Balance on one leg and place the other on your thigh.",
      img: "/yoga/tree.png",
    },
    {
      name: "Downward Dog",
      desc: "Stretch your body in an inverted V shape.",
      img: "/yoga/dog.png",
    },
    {
      name: "Child Pose",
      desc: "Sit back and stretch forward relaxing your body.",
      img: "/yoga/child.png",
    },
  ];

  const [active, setActive] = useState(0);

  // 🔥 Modal state
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="yoga-container">
      <div className="yoga-content">

        <h2 className="yoga-title">Yoga 🧘</h2>

        {/* IMAGE */}
        <div className="yoga-image-wrapper">
          <img
            className="yoga-image"
            src={poses[active].img}
            alt={poses[active].name}
            onClick={() => setShowPreview(true)}
          />
        </div>

        {/* TEXT */}
        <h3 className="yoga-name">{poses[active].name}</h3>
        <p className="yoga-desc">{poses[active].desc}</p>

        {/* BUTTONS */}
        <div className="yoga-list">
          {poses.map((pose, index) => (
            <button
              key={index}
              className={`yoga-btn ${active === index ? "active" : ""}`}
              onClick={() => setActive(index)}
            >
              {pose.name}
            </button>
          ))}
        </div>

      </div>

      {/* 🔥 IMAGE PREVIEW MODAL */}
      {showPreview && (
        <div className="yoga-modal">
          
          <div className="yoga-modal-box">

            {/* CLOSE BUTTON */}
            <button
              className="yoga-close-btn"
              onClick={() => setShowPreview(false)}
            >
              ✕
            </button>

            {/* IMAGE */}
            <img
              src={poses[active].img}
              alt="preview"
              className="yoga-modal-img"
            />

            {/* TITLE */}
            <h4>{poses[active].name}</h4>

          </div>

        </div>
      )}
    </div>
  );
}