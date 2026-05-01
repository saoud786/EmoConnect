// src/components/Chat/Sidebar.jsx

import React from "react";

import {
  MessageCircle,
  UserPlus,
  Bot,
  Zap,
} from "lucide-react";

import "./Sidebar.css";

export default function Sidebar({ view, setView }) {

  const handleViewChange = (newView) => {
    setView(newView);
  };

  return (
  <div className={`chat-sidebar ${view === "peace" ? "sidebar-peace" : ""}`}>
      <div className="sidebar-icons">

        {/* 🔥 RANDOM CHAT */}
        <button
          className={`side-btn ${view === "random" ? "active" : ""}`}
          onClick={() => handleViewChange("random")}
        >
          <Zap size={22} />
          <span className="tooltip">Random Chat</span>
        </button>

        {/* CHAT */}
        <button
          className={`side-btn ${view === "chat" ? "active" : ""}`}
          onClick={() => handleViewChange("chat")}
        >
          <MessageCircle size={22} />
          <span className="tooltip">Chats</span>
        </button>

        {/* ADD USER */}
        <button
          className={`side-btn ${view === "addUser" ? "active" : ""}`}
          onClick={() => handleViewChange("addUser")}
        >
          <UserPlus size={22} />
          <span className="tooltip">Add User</span>
        </button>

        {/* 💚 PEACE HUB */}
        <button
          className={`side-btn ${view === "peace" ? "active" : ""}`}
          onClick={() => handleViewChange("peace")}
        >
          💚
          <span className="tooltip">Peace Hub</span>
        </button>

        {/* EMOAI */}
        <button
          className={`side-btn ${view === "ai" ? "active" : ""}`}
          onClick={() => handleViewChange("ai")}
        >
          <Bot size={22} />
          <span className="tooltip">EmoAI</span>
        </button>

      </div>
    </div>
  );
}