import React, { useState, useEffect } from "react";

import Breathing from "./pages/Breathing";
import Meditation from "./pages/Meditation";
import Yoga from "./pages/Yoga";
import WaterSound from "./pages/WaterSound";
import NightSleep from "./pages/NightSleep";
import QuickRelief from "./pages/QuickRelief";
import PositiveQuotes from "./pages/PositiveQuotes";
import MindCheck from "./pages/MindCheck";

import "./PeaceHub.css";

import {
  Wind,
  Brain,
  Activity,
  Waves,
  Moon,
  Quote,
  HeartPulse,
  Sparkles,     // ✅ NEW
  ChevronDown,
  X,
} from "lucide-react";

export default function PeaceHub() {

  /* 🔥 NAVBAR TOGGLE */
  const [navbarVisible, setNavbarVisible] = useState(false);

  const toggleNavbar = () => {
    setNavbarVisible(prev => {
      const newState = !prev;

      if (newState) {
        document.body.classList.add("peace-active");
      } else {
        document.body.classList.remove("peace-active");
      }

      return newState;
    });
  };

  /* 🔥 MODAL STATE */
  const [activeItem, setActiveItem] = useState(null);

  /* 🔥 BODY SCROLL LOCK + ESC CLOSE */
  useEffect(() => {
    document.body.style.overflow = activeItem ? "hidden" : "";

    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setActiveItem(null);
      }
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [activeItem]);

  /* 🔥 ALL FEATURES (ALL UNIQUE ICONS) */
  const items = [
    {
      title: "Breathing",
      icon: <Wind size={26} />,
      component: <Breathing />,
    },
    {
      title: "Meditation",
      icon: <Brain size={26} />,
      component: <Meditation />,
    },
    {
      title: "Yoga",
      icon: <Activity size={26} />, // 🧘‍♂️ fits yoga
      component: <Yoga />,
    },
    {
      title: "Water Sounds",
      icon: <Waves size={26} />,
      component: <WaterSound />,
    },
    {
      title: "Sleep",
      icon: <Moon size={26} />,
      component: <NightSleep />,
    },
    {
      title: "Quick Relief",
      icon: <Sparkles size={26} />, // ✅ FIXED (now different)
      component: <QuickRelief />,
    },
    {
      title: "Quotes",
      icon: <Quote size={26} />,
      component: <PositiveQuotes />,
    },
    {
      title: "Mind Check",
      icon: <HeartPulse size={26} />,
      component: <MindCheck />,
    }
  ];

  /* 🔥 CONDITIONAL LAYOUT */
  const getLayoutClass = () => {
    if (!activeItem) return "";

    if (activeItem.title === "Night Sleep") return "sleep-full";
    if (activeItem.title === "Quick Relief") return "compact-mode";

    return "";
  };

  return (
    <div className="peacehub-container">

      {/* 🔝 NAVBAR */}
      <div className="peace-top-toggle">
        <button onClick={toggleNavbar}>
          <ChevronDown size={18} />
          {navbarVisible ? "Hide Navbar" : "Show Navbar"}
        </button>
      </div>

      {/* 🎥 HERO */}
      <div className="peacehub-hero">
        <video
          className="peacehub-video"
          src="/nature.mp4"
          autoPlay
          loop
          muted
          playsInline
        />

        <div className="peacehub-overlay">
          <h1>Peace Hub 💚</h1>
          <p>Relax your mind & refresh your soul</p>
        </div>
      </div>

      {/* 🌿 TITLE */}
      <div className="peacehub-section-title">
        <h3>Mind Wellness</h3>
      </div>

      {/* 🌿 GRID */}
      <div className="peacehub-grid">
        {items.map((item, index) => (
          <div
            key={index}
            className="peace-card"
            onClick={() => setActiveItem(item)}
          >
            <div className="peace-icon">{item.icon}</div>
            <span>{item.title}</span>
          </div>
        ))}
      </div>

      {/* 🔥 MODAL */}
      {activeItem && (
        <div className="peace-modal-wrapper">

          {/* BACKDROP */}
          <div
            className="peace-backdrop"
            onClick={() => setActiveItem(null)}
          />

          {/* MODAL BOX */}
          <div
            className={`peace-modal-box ${
              activeItem?.title === "Mind Check" ? "mindcheck-modal" : ""
            }`}
          >

            {/* CLOSE */}
            <button
              className="peace-close-btn"
              onClick={() => setActiveItem(null)}
            >
              <X size={18} />
            </button>

            {/* CONTENT */}
            <div className={`peace-inner-layout ${getLayoutClass()}`}>
              {activeItem.component}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}