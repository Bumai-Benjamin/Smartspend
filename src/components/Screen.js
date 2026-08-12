import React from "react";
import { View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../theme";

export const TABLET_BREAKPOINT = 700;
export const MAX_CONTENT_WIDTH = 640;

// Applies safe-area padding for notches/status bars/home indicators, and caps
// content width on tablets/iPad so cards don't stretch edge-to-edge.
export default function Screen({ children, edges = ["top", "left", "right"], bg = colors.bg, style }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWide = width >= TABLET_BREAKPOINT;

  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: bg,
          paddingTop: edges.includes("top") ? insets.top : 0,
          paddingBottom: edges.includes("bottom") ? insets.bottom : 0,
          paddingLeft: edges.includes("left") ? insets.left : 0,
          paddingRight: edges.includes("right") ? insets.right : 0
        },
        style
      ]}
    >
      <View style={{ flex: 1, width: "100%", maxWidth: isWide ? MAX_CONTENT_WIDTH : undefined, alignSelf: "center" }}>
        {children}
      </View>
    </View>
  );
}
