import React from "react";
import { useTheme } from "../context/ThemeContext";
import "./ThemeToggle.css";

const ORDER = ["system", "light", "dark"];
const ICON = {
  system: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  ),
  light: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  ),
  dark: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  )
};
const LABEL = { system: "System theme", light: "Light theme", dark: "Dark theme" };

export default function ThemeToggle({ className = "" }) {
  const { theme, setTheme } = useTheme();

  function cycle() {
    const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];
    setTheme(next);
  }

  return (
    <button type="button" className={`theme-toggle ${className}`} onClick={cycle} aria-label={`${LABEL[theme]} — click to change`} title={LABEL[theme]}>
      {ICON[theme]}
    </button>
  );
}
