import React from "react";

import "./ChatWindow.css";

export default function FilePreview({ file, onCancel }) {
  if (!file) return null;

  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");

  return (
    <div className="file-preview">
      <div className="preview-box">
        {isImage && (
          <img
            src={URL.createObjectURL(file)}
            alt="preview"
            className="preview-image"
          />
        )}

        {isVideo && (
          <video
            src={URL.createObjectURL(file)}
            controls
            className="preview-video"
          />
        )}

        {!isImage && !isVideo && (
          <div className="preview-file">
            📄 {file.name}
          </div>
        )}

        <button className="cancel-preview" onClick={onCancel}>
          ✖
        </button>
      </div>
    </div>
  );
}