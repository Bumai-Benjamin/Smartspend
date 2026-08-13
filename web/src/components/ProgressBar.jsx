import React from "react";
import { colors } from "../theme";

export default function ProgressBar({ pct, color = colors.accent, bg = colors.track, height = 12 }) {
  const clamped = Math.max(0, Math.min(1, pct));
  return (
    <div style={{ height, borderRadius: 999, background: bg, overflow: "hidden" }}>
      <div style={{ width: `${clamped * 100}%`, height: "100%", borderRadius: 999, background: color, transition: "width 0.3s ease" }} />
    </div>
  );
}
