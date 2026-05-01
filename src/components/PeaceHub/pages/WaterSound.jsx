import React, { useState, useRef, useEffect } from "react";
import "./WaterSound.css";
import { Play, Pause, Volume2 } from "lucide-react";

export default function WaterSound() {

  const sounds = [
    { name: "Rain", file: "/water/rain.mp3" },
    { name: "Ocean", file: "/water/ocean.mp3" },
    { name: "Waterfall", file: "/water/Waterfall.mp3" },
    { name: "River", file: "/water/River.mp3" },
    { name: "Night Rain", file: "/water/Night.mp3" },
  ];

  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [timeLeft, setTimeLeft] = useState(0);

  const audioRef = useRef(null);

  /* ▶️ PLAY / PAUSE */
  const handlePlay = async () => {
    if (!audioRef.current) return;

    try {
      if (playing) {
        audioRef.current.pause();
        setPlaying(false);
      } else {
        await audioRef.current.play();
        setPlaying(true);
      }
    } catch (err) {
      console.log("Play error:", err);
    }
  };

  /* 🔄 CHANGE SOUND */
  const changeSound = (index) => {
    setActive(index);
    setPlaying(false);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  /* 🔊 VOLUME */
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  /* ⏱️ TIMER */
  useEffect(() => {
    if (!playing || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          audioRef.current.pause();
          setPlaying(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [playing, timeLeft]);

  const startTimer = (min) => {
    setTimeLeft(min * 60);
  };

  const formatTime = (t) => {
    const m = Math.floor(t / 60);
    const s = t % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="water-container">

      {/* 🔊 RIGHT SIDE VOLUME */}
      <div className="water-volume-panel">
        <Volume2 size={18} />
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
        />
      </div>

      {/* 🎯 CENTER CONTENT */}
      <div className="water-center">

        <h2 className="water-title">Water Sounds 💧</h2>

        <h3 className="water-name">
          {sounds[active].name}
        </h3>

        {/* 🔥 AUDIO ELEMENT (MAIN FIX) */}
        <audio
          ref={audioRef}
          src={sounds[active].file}
          loop
        />

        {/* ▶️ PLAY BUTTON */}
        <button className="water-btn" onClick={handlePlay}>
          {playing ? <Pause size={18} /> : <Play size={18} />}
          {playing ? "Pause" : "Play"}
        </button>

        {/* ⏱️ TIMER */}
        {timeLeft > 0 && (
          <div className="water-timer">
            ⏱ {formatTime(timeLeft)}
          </div>
        )}

        {/* ⏱️ TIMER BUTTONS */}
        <div className="water-timer-options">
          <button onClick={() => startTimer(5)}>5 min</button>
          <button onClick={() => startTimer(10)}>10 min</button>
          <button onClick={() => startTimer(15)}>15 min</button>
        </div>

        {/* 🎧 SOUND LIST */}
        <div className="water-list">
          {sounds.map((sound, index) => (
            <button
              key={index}
              className={`water-item ${active === index ? "active" : ""}`}
              onClick={() => changeSound(index)}
            >
              {sound.name}
            </button>
          ))}
        </div>

        <p className="water-text">
          Relax your mind with calming water sounds
        </p>

      </div>

    </div>
  );
}