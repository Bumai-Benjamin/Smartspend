import React from "react";
import { colors, fonts } from "../theme";

export default function DonutChart({ segments, size = 140, strokeWidth = 20, centerLabel, centerSub }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  let offsetAcc = 0;

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {segments.map((s, i) => {
          const frac = s.value / total;
          const dash = frac * circumference;
          const el = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={s.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offsetAcc}
              fill="none"
            />
          );
          offsetAcc += dash;
          return el;
        })}
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: fonts.heading, fontSize: 21, color: colors.ink }}>{centerLabel}</span>
        <span style={{ fontFamily: fonts.semibold, fontWeight: 600, fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: colors.inkFaint, marginTop: 4 }}>
          {centerSub}
        </span>
      </div>
    </div>
  );
}
