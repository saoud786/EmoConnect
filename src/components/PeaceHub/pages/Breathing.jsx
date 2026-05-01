import React, { useState, useEffect } from "react";
import "./Breathing.css";

export default function Breathing() {

  // USER SETTINGS
  const [inhaleTime, setInhaleTime] = useState(4);
  const [holdTime, setHoldTime] = useState(2);
  const [exhaleTime, setExhaleTime] = useState(4);
  const [totalMinutes, setTotalMinutes] = useState(1);

  // APP STATE
  const [started, setStarted] = useState(false);
  const [phase, setPhase] = useState("Ready");
  const [scale, setScale] = useState(1);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!started) return;

    const totalTime = totalMinutes * 60;
    let elapsed = 0;

    let timeout;

    const runCycle = () => {
      const cycle = [
        { text: "Inhale", scale: 1.4, time: inhaleTime },
        { text: "Hold", scale: 1.4, time: holdTime },
        { text: "Exhale", scale: 1, time: exhaleTime },
      ];

      let index = 0;

      const loop = () => {
        if (elapsed >= totalTime) {
          setPhase("Done");
          return;
        }

        const current = cycle[index];

        setPhase(current.text);
        setScale(current.scale);
        setSeconds(current.time);

        let count = current.time;

        const countdown = setInterval(() => {
          count--;
          elapsed++;
          setSeconds(count);
          if (count <= 0) clearInterval(countdown);
        }, 1000);

        timeout = setTimeout(() => {
          index = (index + 1) % cycle.length;
          loop();
        }, current.time * 1000);
      };

      loop();
    };

    runCycle();

    return () => clearTimeout(timeout);

  }, [started]);

  return (
    <div className="breathing-container">

      {!started ? (
        /* ===============================
           SETTINGS UI
        ================================ */
        <div className="breathing-settings">

          <h2>Breathing Settings</h2>

          <div className="input-group">
            <label>Inhale (sec)</label>
            <input
              type="number"
              value={inhaleTime}
              onChange={(e) => setInhaleTime(+e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Hold (sec)</label>
            <input
              type="number"
              value={holdTime}
              onChange={(e) => setHoldTime(+e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Exhale (sec)</label>
            <input
              type="number"
              value={exhaleTime}
              onChange={(e) => setExhaleTime(+e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Total Minutes</label>
            <input
              type="number"
              value={totalMinutes}
              onChange={(e) => setTotalMinutes(+e.target.value)}
            />
          </div>

          <button
            className="start-btn"
            onClick={() => setStarted(true)}
          >
            Start Session
          </button>

        </div>
      ) : (
        /* ===============================
           BREATHING UI
        ================================ */
        <>
          <h2 className="breathing-title">Breathing Exercise</h2>

          <div className="breathing-center">

            <div className="breathing-circle-wrapper">
              <div
                className="breathing-circle"
                style={{ transform: `scale(${scale})` }}
              />
            </div>

            <p className="breathing-phase">{phase}</p>
            <p className="breathing-timer">{seconds}s</p>

            <button
              className="stop-btn"
              onClick={() => setStarted(false)}
            >
              Stop
            </button>

          </div>
        </>
      )}

    </div>
  );
}