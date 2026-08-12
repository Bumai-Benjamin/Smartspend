import React from "react";
import { View } from "react-native";
import { colors, radii } from "../theme";

export default function ProgressBar({ pct, color = colors.accent, bg = colors.track, height = 12 }) {
  const clamped = Math.max(0, Math.min(1, pct));
  return (
    <View style={{ height, borderRadius: radii.pill, backgroundColor: bg, overflow: "hidden" }}>
      <View style={{ width: `${clamped * 100}%`, height: "100%", borderRadius: radii.pill, backgroundColor: color }} />
    </View>
  );
}
