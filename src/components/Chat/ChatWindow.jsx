// src/components/Chat/ChatWindow.jsx
import React, { useEffect, useRef, useState } from "react";
import "./ChatWindow.css";

import {
  Image,
  Video,
  FileText,
  Paperclip,
  Download,
  X,
  MessageCircle,
  Phone,
  Mail,
  MessageSquare,
  Users,
  Bell,
  Globe
} from "lucide-react";
import { auth, db } from "../../Firebase";
import { getChatId } from "../../utils/chatid";
import { formatLastSeen } from "../../utils/formatLastSeen";
import UserProfileModal from "./TempProfile";
import uploadToCloudinary from "../../utils/uploadToCloudinary";
import MoodTag from "./MoodTag";

import detectAbuse from "../../utils/detectAbuse";
import CallButton from "./actions/CallButton";
import VideoCallButton from "./actions/VideoCallButton";
import ChatFeedback from "./ChatFeedback";

// const [showWarning, setShowWarning] = useState(false);

import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

export default function ChatWindow({ selectedUser, setSelectedUser }) {
  const currentUser = auth.currentUser;
  const [message, setMessage] = useState("");
  const [showBanPopup, setShowBanPopup] = useState(false);
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState(null);
  
  const [showProfile, setShowProfile] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [selectedImage, setSelectedImage] = useState({ url: "", fileName: "" });
  const [showWarning, setShowWarning] = useState(false);
  const [detectedWords, setDetectedWords] = useState([]);
const [warningCount, setWarningCount] = useState(0);
const [showAllWords, setShowAllWords] = useState(false);
const [typedText, setTypedText] = useState("");
const [mood,setMood] = useState(null);
const [showMood,setShowMood] = useState(false)
const [userTyping, setUserTyping] = useState(false);
const [showFeedback, setShowFeedback] = useState(false);


const [showSupportModal,setShowSupportModal] = useState(false)
const [supportText,setSupportText] = useState("")



const sendSupportRequest = async () => {
console.log("Support button clicked") 
  if(!auth.currentUser) return

  try{

    if(!supportText.trim()){
  alert("Please explain your issue")
  return
}

await addDoc(collection(db,"supportRequests"),{

      userId: auth.currentUser.uid,
      message: supportText || "Please review my account",
      status: "pending",
      createdAt: serverTimestamp()

    })

    alert("Support request sent to admin")

    setSupportText("")
    setShowSupportModal(false)

  }
  catch(err){

    console.error(err)

  }

}


const typingTimeout = useRef(null);

useEffect(() => {

  const loadWarnings = async () => {

    const userRef = doc(db,"users",currentUser.uid)

    const snap = await getDoc(userRef)

    if(snap.exists()){

      const data = snap.data()

      setWarningCount(data.warnings || 0)

    }

  }

  loadWarnings()

},[currentUser])

const [textDone, setTextDone] = useState(false);
const [userActive, setUserActive] = useState(true);
  const bottomRef = useRef(null);
  const attachRef = useRef(null);

  if (!currentUser) return null;

  const chatId =
    selectedUser && currentUser
      ? getChatId(currentUser.uid, selectedUser.uid)
      : null;


      
  // Close attachment popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (attachRef.current && !attachRef.current.contains(event.target)) {
        setShowAttachMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);




// Check if user is active
useEffect(() => {

  const unsub = onSnapshot(
    doc(db, "users", currentUser.uid),
    (snap) => {

      if (snap.exists()) {

        const data = snap.data()

        // update active state
        setUserActive(data.active !== false)

        // show popup if banned
      if (data.active === false && !showBanPopup) {
  setShowBanPopup(true)
}

      }

    }
  )

  return () => unsub()

}, [currentUser.uid])




useEffect(() => {

  const text = "Avoid using abusive language.";
  let index = 0;

  if (showWarning) {

    setTypedText("");
    setTextDone(false);

    const interval = setInterval(() => {

      setTypedText(text.slice(0, index + 1));

      index++;

      if (index === text.length) {

        clearInterval(interval);

        setTimeout(() => {
          setTextDone(true);
        }, 200);

      }

    }, 70);

    return () => clearInterval(interval);

  }

}, [showWarning]);


  // Load messages and mark seen (safely)
  useEffect(() => {
    if (!chatId || !selectedUser) return;

    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, async (snapshot) => {
      const msgs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMessages(msgs);

      // Mark messages as seen ONLY if:
      // - the message sender is NOT currentUser (i.e., we are the receiver)
      // - and the message has been explicitly seen === false
      // Using strict check data.seen === false to avoid undefined -> true problems
      snapshot.docs.forEach(async (docSnap) => {
        const data = docSnap.data();
        if (
          data &&
          data.senderId !== currentUser.uid &&
          data.seen === false
        ) {
          try {
            await updateDoc(docSnap.ref, { seen: true });
          } catch (err) {
            console.error("Error marking message seen:", err);
          }
        }
      });
    });

    return () => unsub();
    // chatId and selectedUser are enough dependencies
  }, [chatId, selectedUser, currentUser.uid]);

  // User status
 useEffect(() => {

  if (!selectedUser?.uid) return;

  const unsub = onSnapshot(
    doc(db, "users", selectedUser.uid),
    (snap) => {

      if (snap.exists()) {

        const userData = snap.data();

        setStatus(userData);

      }

    }
  );

  return () => unsub();

}, [selectedUser]);
useEffect(() => {

  if (!chatId || !selectedUser) return;

  const unsub = onSnapshot(
    doc(db,"chats",chatId),
    (snap) => {

      if(!snap.exists()) return;

      const data = snap.data();

      if(data.typing && data.typing[selectedUser.uid]){
        setUserTyping(true);
      }else{
        setUserTyping(false);
      }

    }
  );

  return () => unsub();

},[chatId,selectedUser])
  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cleanup preview memory
  useEffect(() => {
    return () => {
      if (previewURL) URL.revokeObjectURL(previewURL);
    };
  }, [previewURL]);

  // Select file
  const handleFileUpload = (file) => {
    if (!file) return;

    setSelectedFile(file);
    setPreviewURL(URL.createObjectURL(file));
    setShowAttachMenu(false);
  };

  // Send message
  const sendMessage = async () => {
      if(!userActive){
    alert("Your account has been deactivated by admin")
    return
  }
    if (!chatId) return;

    const chatDocRef = doc(db, "chats", chatId);
    const chatSnap = await getDoc(chatDocRef);

    if (!chatSnap.exists()) {
      await setDoc(chatDocRef, {
        createdAt: serverTimestamp(),
        typing: {},
      });
    }

    // Send file
    if (selectedFile) {
      try {
        setUploading(true);
        setUploadProgress(30);
        const uploaded = await uploadToCloudinary(selectedFile);
        setUploadProgress(100);

        const fileType = selectedFile.type.startsWith("image")
          ? "image"
          : selectedFile.type.startsWith("video")
          ? "video"
          : "file";

        // Ensure seen is explicitly false when sending
        await addDoc(collection(db, "chats", chatId, "messages"), {
          type: fileType,
          fileURL: uploaded.url,
          fileName: selectedFile.name,
          senderId: currentUser.uid,
          createdAt: serverTimestamp(),
          seen: false,
        });

        setSelectedFile(null);
        setPreviewURL(null);
        setUploadProgress(0);
      } catch (err) {
        console.error("Upload error:", err);
      } finally {
        setUploading(false);
      }

      return;
    }

    // Send text
   // Send text
   if (message.trim()) {
   let flagged = false;

const detected = detectAbuse(message);

// const userRef = doc(db,"users",currentUser.uid)
// const userSnap = await getDoc(userRef)


// let warnings = userSnap.data().warnings || 0

// warnings = warnings + 1

// await updateDoc(userRef,{
//   warnings: warnings
// })



if (detected.length > 0) {

flagged = true;
  setDetectedWords(detected);

  // setWarningCount(warnings);

  setShowWarning(true);

  const userRef = doc(db,"users",currentUser.uid)

  const userSnap = await getDoc(userRef)

 let warnings = userSnap.exists() ? userSnap.data().warnings || 0 : 0

  warnings = warnings + 1
  setWarningCount(warnings)

  await updateDoc(userRef,{
    warnings: warnings
  })



  // STEP 3 (YAHI ADD HOGA)
  if(warnings >= 5){

    await updateDoc(userRef,{
      active:false
    })

  }
await addDoc(collection(db,"flaggedMessages"),{
  text: message,
  senderId: currentUser.uid,
  words: detected,
  chatId: chatId,
  warningLevel: warnings,
  createdAt: serverTimestamp()
})
return   // ⭐ yaha add karo


}
  try {
    await addDoc(collection(db, "chats", chatId, "messages"), {
      type: "text",
      text: message,
      mood: mood, 
      senderId: currentUser.uid,
      createdAt: serverTimestamp(),
      seen: false,
     flagged: flagged
    });

    setMessage("");
    await updateDoc(doc(db,"chats",chatId),{
  [`typing.${currentUser.uid}`]: false
});

  } catch (err) {
    console.error("Send message error:", err);
  }
}
  };

  // Open image viewer
  const openImageViewer = (url, fileName) => {
    setSelectedImage({ url, fileName });
    setShowImageViewer(true);
  };

  // Utility to format timestamp safely
  const formatTime = (ts) => {
    if (!ts) return "";
    try {
      // Firestore Timestamp has toDate()
      const date = ts.toDate ? ts.toDate() : new Date(ts);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch (e) {
      return "";
    }
  };

if (!selectedUser) {

  const iconComponents = [
    MessageCircle,
    Phone,
    Video,
    Mail,
    MessageSquare,
    Users,
    Bell,
    Globe
  ];

  const bgIcons = Array.from({ length: 16 }, (_, i) => {

    const Icon = iconComponents[i % iconComponents.length];

    const size = Math.floor(Math.random() * 16 + 24);

    const left = `${Math.random() * 92}%`;

    const duration = `${Math.random() * 18 + 30}s`;

    const delay = `-${Math.random() * 35}s`;

    const opacity = Math.random() * 0.12 + 0.06;

    return {
      Icon,
      size,
      key: i,
      style: {
        left,
        animationDuration: duration,
        animationDelay: delay,
        opacity
      }
    };

  });

  return (
    
    <main className="chat-window">

      {/* Background animation */}
      <div className="chat-bg-animation">

        {bgIcons.map(({ Icon, size, style, key }) => (
          <Icon
            key={key}
            size={size}
            style={style}
            className="chat-bg-icon"
            strokeWidth={1.3}
          />
        ))}

      </div>

      {/* Welcome screen */}
      <div className="chat-empty">

        <div className="chat-empty-inner">

          <img
            src="/logo.png"
            alt="EmoConnect"
            className="chat-empty-logo"
          />

          <h2>Welcome to EmoConnect</h2>

          <p>
            Start a conversation and connect with someone who understands.
            You're not alone here.
          </p>

          <div className="chat-empty-tip">
            💙 Choose a chat from the left to begin
          </div>

        </div>

      </div>

    </main>
  );
}

  const displayName =
    selectedUser.name ||
    selectedUser.userId ||
    selectedUser.anonymousName ||
    selectedUser.email?.split("@")[0] ||
    "User";

 return (
  
  <main className="chat-window">
    {/* HEADER */}




 <div className="chat-header">

  {/* Mobile Back Button */}
  <button
    className="mobile-back-btn"
    onClick={() => setSelectedUser(null)}
  >
    ←
  </button>

  {/* User Info */}
  <div className="header-left" onClick={() => setShowProfile(true)}>



   <div className="avatar-circle">

  {selectedUser?.photoURL ? (
    <img src={selectedUser.photoURL} alt="profile" />
  ) : (
    displayName.charAt(0).toUpperCase()
  )}

  <span className="avatar-tooltip">Profile</span>

</div>


<div>
  <h2>{displayName}</h2>

  <span className={`status-text ${status?.online ? "online" : "offline"}`}>
    {status?.online
      ? "Online"
      : status?.lastSeen
      ? `Last seen ${formatLastSeen(status.lastSeen)}`
      : "Offline"}
  </span>

</div>



  </div>

  {/* 🔹 YE YAHAN ADD KARNA HAI */}
<div className="header-actions">

  <CallButton />

  <VideoCallButton />

  <button
    className="end-chat-btn"
    onClick={() => setShowFeedback(true)}
  >
    End Chat
  </button>

</div>

</div>




      {/* MESSAGES */}
      <div className="chat-messages">
        {messages.map((msg) => {
          const isSender = msg.senderId === currentUser.uid;
          const messageTime = formatTime(msg.createdAt);

          return (
            <div
              key={msg.id}
              className={`msg ${isSender ? "sent" : "received"}`}
            >
              {/* TEXT MESSAGE (WhatsApp-style: text above, time+tick below right) */}
              {msg.type === "text" && (


                <div className="wa-text-wrapper">

  {/* Mood Tag */}
  {msg.mood && (
    <div className="message-mood">
      {msg.mood.emoji} {msg.mood.label}
    </div>
  )}

  {/* Message Text */}
  <span className="wa-text">{msg.text}</span>

  {/* Time + Seen Tick */}
  <div className="wa-meta">
    <span className="wa-time">{messageTime}</span>

    {isSender && (
      <span className={`wa-tick ${msg.seen ? "seen" : ""}`}>
        {msg.seen ? "✓✓" : "✓"}
      </span>
    )}

  </div>

</div>
              )}

              {/* IMAGE MESSAGE */}
              {msg.type === "image" && (
                <div className="image-message">
                  <img
                    src={msg.fileURL}
                    alt=""
                    className="chat-image"
                    onClick={() => openImageViewer(msg.fileURL, msg.fileName)}
                    style={{ cursor: "pointer" }}
                  />

                  <div className="message-meta media-meta">
                    <span className="message-time">{messageTime}</span>

                    {isSender && (
                      <span className={`tick ${msg.seen ? "seen" : ""}`}>
                        {msg.seen ? "✓✓" : "✓"}
                      </span>
                    )}
                  </div>

                  <button
                    className="image-download-btn"
                    onClick={() => downloadFile(msg.fileURL, msg.fileName)}
                  >
                    <Download size={18} />
                  </button>
                </div>
              )}

              {/* VIDEO MESSAGE */}
              {msg.type === "video" && (
                <div className="video-message">
                  <video controls className="chat-video">
                    <source src={msg.fileURL} />
                  </video>

                  <div className="message-meta media-meta">
                    <span className="message-time">{messageTime}</span>

                    {isSender && (
                      <span className={`tick ${msg.seen ? "seen" : ""}`}>
                        {msg.seen ? "✓✓" : "✓"}
                      </span>
                    )}
                  </div>

                  <button
                    className="video-download-btn"
                    onClick={() => downloadFile(msg.fileURL, msg.fileName)}
                  >
                    <Download size={18} />
                  </button>
                </div>
              )}

              {/* FILE MESSAGE */}
              {msg.type === "file" && (
                <div className="file-message">
                  <FileText size={24} className="file-icon" />
                  <div className="file-info">
                    <span className="file-name">{msg.fileName}</span>

                    <div className="message-meta">
                      <span className="message-time">{messageTime}</span>

                      {isSender && (
                        <span className={`tick ${msg.seen ? "seen" : ""}`}>
                          {msg.seen ? "✓✓" : "✓"}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    className="file-download-btn"
                    onClick={() => downloadFile(msg.fileURL, msg.fileName)}
                  >
                    <Download size={18} />
                  </button>
                </div>
              )}
            </div>
          );
        })}

        <div ref={bottomRef}></div>
      </div>

      {/* PROFESSIONAL FILE PREVIEW */}
      {selectedFile && (
        <div className="file-preview-container">
          <div className="file-preview-card">
            {/* Thumbnail / Icon */}
            <div className="preview-media">
              {selectedFile.type.startsWith("image/") && (
                <img src={previewURL} alt="preview" className="preview-image" />
              )}
              {selectedFile.type.startsWith("video/") && (
                <video src={previewURL} className="preview-video" controls />
              )}
              {!selectedFile.type.startsWith("image/") &&
                !selectedFile.type.startsWith("video/") && (
                  <div className="preview-file-icon">
                    <FileText size={32} />
                  </div>
                )}
            </div>

            {/* File details */}
            <div className="preview-details">
              <span className="preview-filename" title={selectedFile.name}>
                {selectedFile.name}
              </span>
              <span className="preview-filesize">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </span>
            </div>

            {/* Cancel button */}
            <button
              className="preview-cancel-btn"
              onClick={() => {
                setSelectedFile(null);
                setPreviewURL(null);
              }}
              disabled={uploading}
            >
              <X size={20} />
            </button>
          </div>

          {/* Upload Progress Bar */}
          {uploading && (
            <div className="upload-progress">
              <div
                className="upload-progress-bar"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
        </div>
      )}

      {/* INPUT */}
      {/* CHAT RESTRICTED ALERT */}

{!userActive && (
<div className="chat-restricted-alert">

⚠ Chat access has been restricted.

<button
className="contact-admin-btn"
onClick={() => setShowSupportModal(true)}
>
Contact Admin
</button>

</div>
)}
{userTyping && (
<div className="typing-indicator">
  <div className="typing-dots">
    <span></span>
    <span></span>
    <span></span>
  </div>
</div>
)}

      <div className="chat-input">

<div className="mood-wrapper">

<button
className={`mood-toggle ${mood ? "active" : ""}`}
onClick={()=>setShowMood(!showMood)}
>
{mood ? mood.emoji : "😊"}
</button>

{showMood && (
<div className="mood-popup">

<MoodTag
selectedMood={mood}
onSelect={(m)=>{

setMood(m)
setShowMood(false)

}}
/>

<button
className="mood-clear"
data-tooltip="Undo mood"
onClick={()=>{
setMood(null)
setShowMood(false)
}}
>
❌
</button>

</div>
)}

</div>

<div className="attachment-wrapper" ref={attachRef}>
          <button
            type="button"
            className="attachment-btn"

            onClick={() => setShowAttachMenu(!showAttachMenu)}
          >
            <Paperclip size={20} />
          </button>

          {showAttachMenu && (
            <div className="attachment-popup">
              <label className="attach-option">
                <Image size={20} />
                <span>Image</span>
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => handleFileUpload(e.target.files[0])}
                />
              </label>

              <label className="attach-option">
                <Video size={20} />
                <span>Video</span>
                <input
                  type="file"
                  accept="video/*"
                  hidden
                  onChange={(e) => handleFileUpload(e.target.files[0])}
                />
              </label>

              <label className="attach-option">
                <FileText size={20} />
                <span>Document</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  hidden
                  onChange={(e) => handleFileUpload(e.target.files[0])}
                />
              </label>
            </div>
          )}
        </div>
<input
  value={message}
 placeholder={
  !userActive
    ? "⚠ Chat access restricted"
    : "Type message..."
}



onChange={async (e) => {

  const value = e.target.value;
  setMessage(value);

  if (!chatId) return;

  const chatRef = doc(db, "chats", chatId);

  await updateDoc(chatRef, {
    [`typing.${currentUser.uid}`]: true
  });

  clearTimeout(typingTimeout.current);

  typingTimeout.current = setTimeout(async () => {

    await updateDoc(chatRef, {
      [`typing.${currentUser.uid}`]: false
    });

  }, 2000);

}}
  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
 disabled={uploading || !userActive}
/>
       <button
  onClick={sendMessage}
  disabled={uploading || !userActive}
>
  {uploading ? "..." : "➤"}
</button>
      </div>



      {/* IMAGE VIEWER MODAL */}
      {showImageViewer && (
        <div
          className="image-viewer-overlay"
          onClick={() => setShowImageViewer(false)}
        >
          <div
            className="image-viewer-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="image-viewer-close"
              onClick={() => setShowImageViewer(false)}
            >
              <X size={24} />
            </button>
            <img
              src={selectedImage.url}
              alt="Full size"
              className="image-viewer-img"
            />
            <button
              className="image-viewer-download"
              onClick={() =>
                downloadFile(selectedImage.url, selectedImage.fileName)
              }
            >
              <Download size={24} />
            </button>
          </div>
        </div>
      )}

      {showProfile && (
        <UserProfileModal user={selectedUser} onClose={() => setShowProfile(false)} />
      )}

{showFeedback && (
  <ChatFeedback
    chatId={chatId}
    onClose={() => setShowFeedback(false)}
  />
)}



{showWarning && (
  <div className="warning-overlay">
    <div className="warning-box">

      <div className="warning-icon">⚠</div>

      <h3>Abusive Language Detected</h3>

      <p className="warning-count">
        Warning {warningCount} / 5
      </p>

      <div className="detected-words">

        {(showAllWords ? detectedWords : detectedWords.slice(0,3)).map((word, i) => (
          <span key={i} className="word-badge">
            {word}
          </span>
        ))}

        {detectedWords.length > 3 && (
          <span
            className="word-more"
            onClick={() => setShowAllWords(!showAllWords)}
          >
            {showAllWords ? "less" : `+${detectedWords.length - 3}`}
          </span>
        )}

      </div>

    <p className={`warning-tip ${textDone ? "tip-pop" : ""}`}>
  {typedText}
</p>
      <button
        className="warning-btn"
        onClick={() => setShowWarning(false)}
      >
        OK
      </button>

    </div>
  </div>
)}



{showBanPopup && (

  <div className="warning-overlay">


    <div className="warning-box">

      <div className="warning-icon">⛔</div>

    <h3>Chat Access Restricted</h3>

      <p>
        Your account has been deactivated because abusive language
        was detected in your messages.
      </p>

      <p className="warning-tip">
        Please contact the administrator if you believe this is a mistake.
      </p>

      <button
        onClick={() => setShowBanPopup(false)}
      >
        OK
      </button>

    </div>

  </div>

)}

{showSupportModal && (

<div className="support-overlay">

  <div className="support-box">

    <h3>Contact Admin</h3>

    <textarea
      placeholder="Explain your issue..."
      value={supportText}
      onChange={(e)=>setSupportText(e.target.value)}
    />

    <div className="support-actions">

      <button
        className="support-send"
        onClick={sendSupportRequest}
      >
        Send Request
      </button>

      <button
        className="support-cancel"
        onClick={()=>setShowSupportModal(false)}
      >
        Cancel
      </button>

    </div>

  </div>

</div>

)}
    </main>
    

    
  );
}

// Improved download (works better with CORS-friendly URLs)
async function downloadFile(url, name) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const blobURL = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobURL;
    link.download = name || "file";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobURL);
  } catch (err) {
    // fallback to simple anchor if fetch fails
    const link = document.createElement("a");
    link.href = url;
    link.download = name || "file";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.error("Download error:", err);
  }
}