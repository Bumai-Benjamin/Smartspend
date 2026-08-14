export const LIGHT_COLORS = {
  bg: "#f5ead8",
  card: "#f9f4ed",
  cardHover: "#eee7db",
  cardPress: "#dcd3c4",
  ink: "#201e1d",
  inkSoft: "rgba(32,30,29,0.62)",
  inkFaint: "rgba(32,30,29,0.5)",
  inkFainter: "rgba(32,30,29,0.35)",
  hairline: "rgba(32,30,29,0.1)",
  onAccent: "#f9f4ed",
  accent: "#c67139",
  accentPress: "#b2622d",
  accentDark: "#8c491a",
  accentDeep: "#643312",
  tint: "#ebddc5",
  tintWarm: "#ffe1d0",
  tintTrack: "rgba(32,30,29,0.12)",
  track: "#e3d8c2",
  trackAlt: "#dcd3c4",
  sage: "#56633f",
  sageDark: "#272e1b",
  sageBg: "#f0fae1",
  sageTrack: "#ccdbb2",
  sageFill: "#728157",
  warnBg: "#fff2eb",
  warnText: "#643312",
  danger: "#a63a2e",
  dangerBg: "#fbe4dd"
};

export const DARK_COLORS = {
  bg: "#17140f",
  card: "#221d17",
  cardHover: "#2c251d",
  cardPress: "#382f24",
  ink: "#f4ecdf",
  inkSoft: "rgba(244,236,223,0.66)",
  inkFaint: "rgba(244,236,223,0.5)",
  inkFainter: "rgba(244,236,223,0.34)",
  hairline: "rgba(244,236,223,0.12)",
  onAccent: "#f9f4ed",
  accent: "#d98a54",
  accentPress: "#c2723e",
  accentDark: "#e2a06c",
  accentDeep: "#f0c199",
  tint: "#362a1d",
  tintWarm: "#43301f",
  tintTrack: "rgba(244,236,223,0.14)",
  track: "#362d22",
  trackAlt: "#40372c",
  sage: "#8bab5f",
  sageDark: "#c3dba0",
  sageBg: "#202a17",
  sageTrack: "#2f3d22",
  sageFill: "#8bab5f",
  warnBg: "#3a2a1d",
  warnText: "#f0c199",
  danger: "#e2685a",
  dangerBg: "#3a221d"
};

export function getColors(scheme) {
  return scheme === "dark" ? DARK_COLORS : LIGHT_COLORS;
}

export const fonts = {
  heading: "Caprasimo_400Regular",
  regular: "Figtree_400Regular",
  semibold: "Figtree_600SemiBold",
  bold: "Figtree_700Bold"
};

export const radii = { sm: 16, md: 22, lg: 28, pill: 999 };
