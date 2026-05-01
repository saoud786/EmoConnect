import React, { useEffect, useRef, useState } from "react";
import "./RandomChatWindow.css";
import { getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "../../Firebase";

import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc
} from "firebase/firestore";

/* ========================= */
/* 🔥 ABUSE DETECTION */

const normalize = (text) =>
  text.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "");

const badWords = [
  "shit",
  "bitch",
  "kill",
  "idiot",
  "stupid",
  "loser",
  "fool",
  "moron",
  "jerk",
  "toxic",
  "dumb",
  "nonsense",
  "annoying",
  "useless",
  "rude"
];

const harmfulPhrases = [
  "kill yourself",
  "i will suicide",
  "i want to die",
  "i will kill myself",
  "suicide",
  "end my life"
];

const buildPattern = (word) => {
  const map = {
    a: "[a@4]",
    i: "[i1!]",
    s: "[s$5]",
    o: "[o0]",
    e: "[e3]",
    t: "[t7]"
  };

  return new RegExp(
    word.split("").map((c) => map[c] || c).join("\\s*"),
    "i"
  );
};

const patterns = badWords.map(buildPattern);

const detectAbuse = (msg) => {
  const detected = [];
  const clean = normalize(msg);

  patterns.forEach((regex, i) => {
    if (regex.test(msg)) detected.push(badWords[i]);
  });

  harmfulPhrases.forEach((p) => {
    if (clean.includes(normalize(p))) detected.push(p);
  });

  return detected;
};

/* ========================= */

export default function RandomChatWindow({ selectedUser, onNextChat }) {
  
  const [waiting, setWaiting] = useState(false);
const [showDecision, setShowDecision] = useState(false);
const [decisionTaken, setDecisionTaken] = useState(false);
  const currentUser = auth.currentUser;

  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
const [otherTyping, setOtherTyping] = useState(false);
  const [message, setMessage] = useState("");
  const [chatStatus, setChatStatus] = useState("active");

  const [showWarning, setShowWarning] = useState(false);
  const [warningText, setWarningText] = useState("");

  const [blockedMessage, setBlockedMessage] = useState(null);

  const bottomRef = useRef(null);
  const chatId = selectedUser?.chatId;

  /* ========================= */
  /* LOAD MESSAGES */

  useEffect(() => {
    if (!chatId) return;

    const q = query(
      collection(db, "randomChats", chatId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
    });

    return () => unsub();
  }, [chatId]);

  /* ========================= */
  /* CHAT STATUS */
useEffect(() => {
  if (!chatId) return;

const unsub = onSnapshot(doc(db, "randomChats", chatId), async (snap) => {
  const data = snap.data();
  const users = data?.continueUsers || [];

  if (users.length === 2 && !data?.isSaved) {
    await updateDoc(doc(db, "randomChats", chatId), {
      isSaved: true // 🔥 THIS LINE FIXES EVERYTHING
    });

    setWaiting(false);
    setShowDecision(false);
  }
});

  return () => unsub();
}, [chatId]);
  useEffect(() => {
    if (!chatId) return;

    const unsub = onSnapshot(doc(db, "randomChats", chatId), (docSnap) => {
      const data = docSnap.data();

      if (data?.status === "ended") {
        if (data.endedBy !== currentUser.uid) {
          setChatStatus("ended");
        } else {
          setChatStatus("self-ended");
        }
      }
    });

    return () => unsub();
  }, [chatId, currentUser]);

  /* ========================= */
  /* AUTO SCROLL */
useEffect(() => {
  if (!chatId || chatStatus === "ended") return;

  setShowDecision(false);
  setDecisionTaken(false);

  const timer = setTimeout(() => {
    if (chatStatus !== "ended") {
      setShowDecision(true);
    }
  }, 30000);

  return () => clearTimeout(timer);
}, [chatId, chatStatus]);

useEffect(() => {
  if (chatStatus === "ended") {
    setShowDecision(false);   // ❌ popup band
    setDecisionTaken(true);   // ❌ dobara na aaye
  }
}, [chatStatus]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, blockedMessage]);

  /* ========================= */
  /* SEND MESSAGE */

  const sendMessage = async () => {
    if (!message.trim() || !chatId || chatStatus !== "active") return;

    const detected = detectAbuse(message);

    /* 🔴 ABUSE DETECTED */
  if (detected.length > 0) {

  const detectedWord = detected[0];

  let cleanText = "";

  // 🔥 PROFESSIONAL + SHORT MESSAGE
  if (detectedWord.includes("suicide")) {
    cleanText = `Your message contains "${detectedWord}". Please consider reaching out for support.`;
  } else {
    cleanText = `Message not sent. "${detectedWord}" is not allowed. Let’s keep things respectful.`;
  }

  // 🔥 SHOW ONLY IN CHAT (NO DUPLICATE)
setBlockedMessage({
  id: Date.now(),
  text: cleanText,
  type: "blocked",
  word: detectedWord
});

  // 🔥 SAVE FLAGGED MESSAGE
  await addDoc(collection(db, "flaggedMessages"), {
    text: message,
    senderId: currentUser.uid,
    chatId: chatId,
    words: detected,
    type: "randomChat",
    createdAt: serverTimestamp()
  });

  // 🔥 CLEAR INPUT
  setMessage("");

  return;
}

    /* ✅ NORMAL MESSAGE */
    try {
      await addDoc(
        collection(db, "randomChats", chatId, "messages"),
        {
          text: message,
          senderId: currentUser.uid,
          createdAt: serverTimestamp(),
          seen: false
        }
      );

      await updateDoc(doc(db, "randomChats", chatId), {
        lastMessage: message,
        updatedAt: serverTimestamp()
      });

      setBlockedMessage(null);
      setMessage("");
      await updateDoc(doc(db, "randomChats", chatId), {
  typing: null
});
    } catch (err) {
      console.error(err);
    }
  };
useEffect(() => {
  if (!chatId) return;

  const unsub = onSnapshot(doc(db, "randomChats", chatId), (snap) => {
    const data = snap.data();

    if (!data) return;

    if (data.typing && data.typing !== currentUser.uid) {
      setOtherTyping(true);
    } else {
      setOtherTyping(false);
    }
  });

  return () => unsub();
}, [chatId]);
  // 🔥 CONTINUE CHAT FUNCTION
const handleContinueChat = async () => {
  if (!chatId) return;

  setWaiting(true);        // 🔥 loading start
  setDecisionTaken(true);  // popup band

  try {
    const chatRef = doc(db, "randomChats", chatId);

    const chatSnap = await getDoc(chatRef);
    const chatData = chatSnap.data();

    const list = chatData?.continueUsers || [];

    const updated = [...new Set([...list, currentUser.uid])];

    await updateDoc(chatRef, {
      continueUsers: updated
    });

  } catch (err) {
    console.error(err);
  }
};
  /* ========================= */

  const handleNextChat = () => {
    if (onNextChat) onNextChat();
  };

  const handleNextFromPopup = () => {
  setDecisionTaken(true);
  setShowDecision(false);

  if (onNextChat) onNextChat();
};
  if (!selectedUser) {
    return <div className="rc-empty">Find a new chat 👀</div>;
  }

  return (
    <div className="rc-container">

      {/* HEADER */}
      <div className="rc-header">
        <div className="rc-user">
          <div className="rc-avatar">👤</div>
          <div>
            <h3>Stranger</h3>
            <span>Anonymous</span>
          </div>
        </div>

        <button className="rc-next-btn" onClick={handleNextChat}>
          Next Chat →
        </button>
      </div>
      





      {/* MESSAGES */}
      <div className="rc-messages">

        {showWarning && (
          <div className="rc-warning">{warningText}</div>
        )}

        {chatStatus === "ended" && (
          <div className="rc-disconnected-wrapper">
            <div className="rc-disconnected-box">
              <p>Stranger has disconnected.</p>
              <button onClick={handleNextChat}>
                Start New Chat →
              </button>
            </div>
          </div>
        )}

        {messages.length === 0 && (
          <div className="rc-empty-chat">
            <img src="/logo.png" alt="logo" className="rc-empty-logo" />
            <h3 className="rc-empty-title">You're connected</h3>
            <p className="rc-empty-subtitle">
              Start the conversation with a friendly message
            </p>
          </div>
        )}

        {[...messages, ...(blockedMessage ? [blockedMessage] : [])].map((msg) => {

          const isBlocked = msg.type === "blocked";
          const isMe = msg.senderId === currentUser.uid;

          return (
            <div
              key={msg.id}
              className={`rc-msg ${
                isBlocked ? "rc-blocked" : isMe ? "rc-sent" : "rc-received"
              }`}
            >
              <div className="rc-bubble">
               {msg.type === "blocked" ? (
  <>
    {msg.text.split(`"${msg.word}"`).map((part, i, arr) => (
      <span key={i}>
        {part}
        {i !== arr.length - 1 && (
          <span className="highlight-word">"{msg.word}"</span>
        )}
      </span>
    ))}
  </>
) : (
  msg.text
)}

                {!isBlocked && (
                  <div className="rc-meta">
                    <span className="rc-time">
                      {msg.createdAt?.toDate?.().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                    {isMe && <span className="rc-tick">✓</span>}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <div ref={bottomRef}></div>
      </div>

      {/* INPUT */}
     {/* INPUT AREA */}
<div className="rc-input-area">

  {/* ✅ TYPING INDICATOR (UPAR AAJAYEGA) */}
  {otherTyping && (
    <div className="typing-wrapper">
      <div className="typing-bubble">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  )}

  {/* ✅ INPUT BOX */}
  <div className="rc-input">

    <input
      value={message}
      placeholder={
        chatStatus === "ended"
          ? "Chat ended"
          : "Type your message..."
      }
      onChange={async (e) => {
        const value = e.target.value;
        setMessage(value);

        if (!chatId) return;

        if (!isTyping && value.trim() !== "") {
          setIsTyping(true);
          await updateDoc(doc(db, "randomChats", chatId), {
            typing: currentUser.uid
          });
        }

        if (value.trim() === "") {
          setIsTyping(false);
          await updateDoc(doc(db, "randomChats", chatId), {
            typing: null
          });
        }
      }}
      onBlur={async () => {
        if (!chatId) return;
        setIsTyping(false);
        await updateDoc(doc(db, "randomChats", chatId), {
          typing: null
        });
      }}
      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
    />

    <button onClick={sendMessage}>➤</button>

  </div>
</div>
      
{chatStatus === "active" && showDecision && !decisionTaken && (
  <div className="rc-decision-wrapper">
    <div className="rc-decision-box">
      <p>Do you want to continue this chat?</p>

      <div className="rc-decision-actions">
        <button onClick={handleContinueChat}>
          Continue Chat
        </button>

        <button onClick={handleNextFromPopup}>
          Next Chat
        </button>
      </div>
    </div>
  </div>
)}
{waiting && chatStatus === "active" && (
  <div className="rc-decision-wrapper">
    <div className="rc-decision-box">
     <p>Waiting for the other user to continue...</p>

  <div className="rc-loader"></div>
    </div>
  </div>
)}

    </div>
  );
}