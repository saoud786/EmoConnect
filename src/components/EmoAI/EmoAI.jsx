import React, { useState, useRef, useEffect } from "react";
import "./EmoAI.css";

export default function EmoAI({ setView }) {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message;

    setChat((prev) => [...prev, { type: "user", text: userMessage }]);
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "mistralai/mistral-7b-instruct",
            messages: [
              {
                role: "system",
                content:
                  "You are EmoAI, a calm and emotionally supportive assistant. Respond gently, positively, and with empathy. Do not give medical diagnosis.",
              },
              {
                role: "user",
                content: userMessage,
              },
            ],
          }),
        }
      );

      const data = await response.json();

      const text =
        data?.choices?.[0]?.message?.content || "I'm here for you 💙";

      setChat((prev) => [...prev, { type: "ai", text }]);
    } catch (error) {
      console.error("OpenRouter Error:", error);

      setChat((prev) => [
        ...prev,
        {
          type: "ai",
          text: "⚠️ Something went wrong. Please try again.",
        },
      ]);
    }

    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="emoai-container">
      
      {/* HEADER */}
    <div className="emoai-header">

  <button
    className="mobile-back-btn"
    onClick={() => setView("chat")}
  >
    ←
  </button>

  <div className="emoai-header-text">
    <h2>EmoAI 🤖</h2>
    <p>Your private emotional support assistant</p>
  </div>

</div>

      {/* CHAT AREA */}
      <div className="emoai-chat">
        {chat.length === 0 && (
          <div className="welcome-msg">
            Welcome to EmoAI 💙 <br />
            Share your thoughts. I'm here to support you.
          </div>
        )}

        {chat.map((msg, index) => (
          <div
            key={index}
            className={`chat-bubble ${
              msg.type === "user" ? "user-bubble" : "ai-bubble"
            }`}
          >
            {msg.text}
          </div>
        ))}

        {loading && (
          <div className="chat-bubble ai-bubble typing">
            EmoAI is thinking...
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* INPUT */}
      <div className="emoai-input">
        <input
          type="text"
          placeholder="Share your thoughts..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
        />

        <button onClick={sendMessage}>Send</button>
      </div>

    </div>
  );
}