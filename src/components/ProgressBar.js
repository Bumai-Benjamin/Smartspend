import React from "react";
import { View } from "react-native";
import { radii } from "../theme";
import { useTheme } from "../context/ThemeContext";

export default function ProgressBar({ pct, color, bg, height = 12 }) {
  const { colors } = useTheme();
  const clamped = Math.max(0, Math.min(1, pct));
  return (
    <View style={{ height, borderRadius: radii.pill, backgroundColor: bg || colors.track, overflow: "hidden" }}>
      <View style={{ width: `${clamped * 100}%`, height: "100%", borderRadius: radii.pill, backgroundColor: color || colors.accent }} />
    </View>
  );
}
