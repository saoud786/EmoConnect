import { createContext, useState } from "react";
import "./ThemeContext.css";

export const ThemeContext = createContext();

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(
    localStorage.getItem("emo-theme") || "dark"
  );

  const toggleTheme = () => {
    setTheme((prev) => {
      const newTheme = prev === "dark" ? "light" : "dark";
      localStorage.setItem("emo-theme", newTheme);
      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {/* ✅ Theme ONLY inside this wrapper */}
      <div className={`emo-chat-theme ${theme}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
