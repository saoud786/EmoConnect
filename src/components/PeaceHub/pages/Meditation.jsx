import React, { useState, useEffect } from "react";
import "./Meditation.css";
import { Play, Pause, RotateCcw, X } from "lucide-react";

export default function Meditation() {

  const [time, setTime] = useState(300);
  const [running, setRunning] = useState(false);

  // 🔥 NEW (image modal)
  const [showImage, setShowImage] = useState(false);

  const formatTime = (t) => {
    const min = Math.floor(t / 60);
    const sec = t % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [running]);

  const setTimer = (minutes) => {
    setTime(minutes * 60);
    setRunning(false);
  };

  const resetTimer = () => {
    setTime(300);
    setRunning(false);
  };

  return (
    <div className="meditation-container">

      <div className="meditation-content">

        {/* TITLE */}
        <h2 className="meditation-title">Meditation 🧘</h2>

        {/* IMAGE (CLICKABLE) */}
        <img
          className="meditation-image"
          src="/meditation.png"
          alt="Meditation"
          onClick={() => setShowImage(true)} // 🔥 CLICK OPEN
          onError={(e) => (e.target.style.display = "none")}
        />

        {/* TIMER */}
        <div className="meditation-timer">
          {formatTime(time)}
        </div>

        {/* CONTROLS */}
        <div className="meditation-controls">

          <button
            className="meditation-btn primary"
            onClick={() => setRunning(!running)}
          >
            {running ? <Pause size={18} /> : <Play size={18} />}
            {running ? "Pause" : "Start"}
          </button>

          <button
            className="meditation-btn secondary"
            onClick={resetTimer}
          >
            <RotateCcw size={18} />
            Reset
          </button>

        </div>

        {/* OPTIONS */}
        <div className="meditation-options">
          <button onClick={() => setTimer(5)}>5 min</button>
          <button onClick={() => setTimer(10)}>10 min</button>
          <button onClick={() => setTimer(15)}>15 min</button>
        </div>

        {/* TEXT */}
        <p className="meditation-text">
          Close your eyes, relax your body, and focus on your breath
        </p>

      </div>

      {/* 🔥 IMAGE MODAL (SAME AS YOGA STYLE) */}
      {showImage && (
        <div className="meditation-modal" onClick={() => setShowImage(false)}>

          <div
            className="meditation-modal-box"
            onClick={(e) => e.stopPropagation()}
          >

            {/* CLOSE BUTTON */}
            <button
              className="meditation-close"
              onClick={() => setShowImage(false)}
            >
              <X size={18} />
            </button>

            {/* BIG IMAGE */}
            <img
              src="/meditation.png"
              alt="Meditation Large"
              className="meditation-modal-img"
            />

          </div>

        </div>
      )}

    </div>
  );
}