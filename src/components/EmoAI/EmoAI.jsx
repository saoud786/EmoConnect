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
    if (!message.trim() || loading) return;

    const userMessage = message.trim();

    const updatedChat = [...chat, { type: "user", text: userMessage }];
    setChat(updatedChat);
    setMessage("");
    setLoading(true);

    try {
      const currentTime = new Date().toLocaleTimeString();

      const messages = [
        {
          role: "system",
          content: `
You are EmoAI, a smart and friendly assistant.

Current time: ${currentTime}

Rules:
- ALWAYS reply in simple English
- ALWAYS answer the user's message directly
- If user says "hello" → greet naturally
- If user says "how are you" → respond normally
- If user asks time → tell correct time
- Keep replies short (1-2 lines)
- Do NOT repeat phrases
- Do NOT say "I don't understand" for simple messages
- Sound like a real human, not a therapist
`,
        },
        ...updatedChat.map((msg) => ({
          role: msg.type === "user" ? "user" : "assistant",
          content: msg.text,
        })),
      ];

      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "meta-llama/llama-3-8b-instruct", // 🔥 better English handling
            messages,
            temperature: 0.8,
            top_p: 0.9,
            max_tokens: 120,
          }),
        }
      );

      const data = await response.json();

      let aiText =
        data?.choices?.[0]?.message?.content?.trim() || "";

      // 🔥 CLEAN BAD RESPONSES
      if (
        !aiText ||
        aiText.toLowerCase().includes("i don't understand") ||
        aiText.length < 2
      ) {
        const fallbackReplies = [
          "Hey 🙂 what's up?",
          "Tell me more 🙂",
          "I'm here, go on 🙂",
        ];
        aiText =
          fallbackReplies[
            Math.floor(Math.random() * fallbackReplies.length)
          ];
      }

      // 🔥 HUMAN DELAY
      const delay = 500 + Math.random() * 1000;

      setTimeout(() => {
        setChat((prev) => [...prev, { type: "ai", text: aiText }]);
        setLoading(false);
      }, delay);
    } catch (error) {
      console.error("AI Error:", error);

      const fallbackReplies = [
        "Network issue... try again",
        "Something went wrong... send again",
      ];

      setChat((prev) => [
        ...prev,
        {
          type: "ai",
          text:
            fallbackReplies[
              Math.floor(Math.random() * fallbackReplies.length)
            ],
        },
      ]);

      setLoading(false);
    }
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

      {/* CHAT */}
      <div className="emoai-chat">
        {chat.length === 0 && (
          <div className="welcome-msg">
            Hey 👋 <br />
            What's on your mind? 🙂
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
            typing...
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* INPUT */}
      <div className="emoai-input">
        <input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
        />

        <button onClick={sendMessage} disabled={loading}>
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}