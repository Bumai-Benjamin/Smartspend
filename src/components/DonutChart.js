import React from "react";
import Svg, { Circle } from "react-native-svg";
import { View, Text, StyleSheet } from "react-native";
import { colors, fonts } from "../theme";

// Segmented ring: each segment is a stroke-dashoffset arc on a shared circle.
export default function DonutChart({ segments, size = 132, strokeWidth = 18, centerLabel, centerSub }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  let offsetAcc = 0;
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: "-90deg" }] }}>
        {segments.map((s, i) => {
          const frac = s.value / total;
          const dash = frac * circumference;
          const el = (
            <Circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={s.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offsetAcc}
              fill="none"
              strokeLinecap="butt"
            />
          );
          offsetAcc += dash;
          return el;
        })}
      </Svg>
      <View style={StyleSheet.absoluteFillObject}>
        <View style={styles.center}>
          <Text style={styles.centerLabel}>{centerLabel}</Text>
          <Text style={styles.centerSub}>{centerSub}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  centerLabel: { fontFamily: fonts.heading, fontSize: 20, color: colors.ink },
  centerSub: {
    fontFamily: fonts.semibold,
    fontSize: 9.5,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.inkFaint,
    marginTop: 4
  }
});
