import React, { useState, useRef, useEffect } from "react";
import "./NightSleep.css";
import { Play, Pause, Volume2 } from "lucide-react";

export default function NightSleep() {

  const sounds = [
    { name: "Deep Sleep", file: "/sleep/deep.mp3" },
    { name: "Ambience", file: "/sleep/Ambience.mp3" },
    { name: "Soft Piano", file: "/sleep/piano.mp3" },
  ];

  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);

  const audioRef = useRef(null);

  /* 🔥 INIT */
  useEffect(() => {
    const audio = new Audio(sounds[0].file);
    audio.loop = true;
    audio.volume = volume;

    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  /* ▶️ PLAY / PAUSE */
  const handlePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (playing) {
        audio.pause();
        setPlaying(false);
      } else {
        await audio.play();
        setPlaying(true);
      }
    } catch (e) {
      console.log("Play error:", e);
    }
  };

  /* 🔄 CHANGE SOUND */
  const changeSound = async (index) => {
    const audio = audioRef.current;
    if (!audio) return;

    const wasPlaying = playing;

    audio.pause();

    audio.src = sounds[index].file;
    audio.load();
    audio.volume = volume;

    setActive(index);

    if (wasPlaying) {
      try {
        await audio.play();
      } catch (e) {}
    }
  };

  /* 🔊 VOLUME (SAFE) */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;

    // 🔥 FORCE RESUME IF NEEDED
    if (playing && audio.paused) {
      audio.play().catch(() => {});
    }
  }, [volume]);

  return (
    <div className="sleep-container">

      {/* 🔊 VOLUME */}
      <div className="sleep-volume">
        <Volume2 size={18} />

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}

          onMouseDown={(e) => e.stopPropagation()}   // 🔥 FIX
          onClick={(e) => e.stopPropagation()}       // 🔥 FIX

          onChange={(e) => {
            e.stopPropagation();
            setVolume(parseFloat(e.target.value));
          }}
        />
      </div>

      {/* 🎯 CENTER */}
      <div className="sleep-content">

        <h2 className="sleep-title">Sleep Sounds 💚</h2>

        <h3 className="sleep-name">
          {sounds[active].name}
        </h3>

        <button className="sleep-btn" onClick={handlePlay}>
          {playing ? <Pause size={18} /> : <Play size={18} />}
          {playing ? "Pause" : "Play"}
        </button>

        <div className="sleep-list">
          {sounds.map((sound, index) => (
            <button
              key={index}
              className={`sleep-item ${active === index ? "active" : ""}`}
              onClick={() => changeSound(index)}
            >
              {sound.name}
            </button>
          ))}
        </div>

        <p className="sleep-text">
          Relax your mind and enjoy peaceful sounds
        </p>

      </div>

    </div>
  );
}