import React from "react";
import "./PeaceLayout.css";

export default function PeaceLayout({ title, children }) {
  return (
    <div className="peace-layout">
      <h2>{title}</h2>

      <div className="peace-content">
        {children}
      </div>
    </div>
  );
}