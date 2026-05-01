import React, { useState, useEffect } from "react";
import "./PositiveQuotes.css";
import { RefreshCcw } from "lucide-react";

export default function PositiveQuotes() {

  const quotes = [
    "You are not behind in life. You are exactly where you need to be.",
    "This moment is tough, but you are tougher.",
    "Your mind is powerful — speak to it with kindness.",
    "You don’t need to have everything figured out today.",
    "Peace begins when you stop fighting yourself.",
    "You are allowed to take things slowly.",
    "Even the darkest nights end with sunrise.",
    "You are healing, even if it doesn’t feel like it.",
    "Your feelings matter. You matter.",
    "Growth takes time — be patient with yourself.",
    "Not every day has to be productive to be meaningful.",
    "You survived 100% of your worst days so far.",
    "It’s okay to pause. It’s not okay to give up.",
    "You are stronger than your anxiety.",
    "One step at a time is still progress.",
    "You deserve calm, clarity, and happiness.",
    "Your story is not over yet.",
    "Let today be enough.",
    "You are not alone — even when it feels like it.",
    "Breathe. Reset. Continue.",
    "Your worth is not defined by your struggles.",
    "Be gentle with yourself, you’re doing your best.",
    "Hard times are shaping a stronger you.",
    "You are capable of handling what comes your way.",
    "Small wins are still wins.",
    "You deserve to feel safe in your own mind.",
    "Healing is not linear — and that’s okay.",
    "You are learning, growing, evolving every day."
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  /* 🔥 RANDOM QUOTE GENERATOR (NO REPEAT FIX) */
  const getRandomIndex = () => {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * quotes.length);
    } while (newIndex === currentIndex); // same repeat nahi aayega

    return newIndex;
  };

  /* 🔥 FIRST LOAD RANDOM */
  useEffect(() => {
    setCurrentIndex(Math.floor(Math.random() * quotes.length));
  }, []);

  /* 🔥 NEXT QUOTE */
  const nextQuote = () => {
    setCurrentIndex(getRandomIndex());
  };

  return (
    <div className="quotes-container">

      <div className="quotes-content">

        <h2 className="quotes-title">Positive Quotes 💚</h2>

        {/* 💬 QUOTE CARD */}
        <div className="quotes-card">
          <p className="quotes-text">
            “{quotes[currentIndex]}”
          </p>
        </div>

        {/* 🔄 BUTTON */}
        <button className="quotes-btn" onClick={nextQuote}>
          <RefreshCcw size={16} />
          New Thought
        </button>

        <p className="quotes-footer">
          Take a breath. You’re doing better than you think 🌱
        </p>

      </div>

    </div>
  );
}