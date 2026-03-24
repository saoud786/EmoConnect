import React from "react";
import "./ChatWindow.css";

export default function AttachmentButton({ onFileSelect }) {
  return (
    <label className="attachment-btn">
      📎
      <input
        type="file"
        hidden
        onChange={(e) => {
          if (e.target.files[0]) {
            onFileSelect(e.target.files[0]);
            e.target.value = "";
          }
        }}
      />
    </label>
  );
}