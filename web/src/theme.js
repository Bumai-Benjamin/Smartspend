// These map to the CSS custom properties defined in index.css, so any
// component reading colors.xxx automatically follows the active theme
// (system preference or manual override) without needing React state.
export const colors = {
  bg: "var(--bg)",
  card: "var(--card)",
  cardHover: "var(--card-hover)",
  cardPress: "var(--track-alt)",
  ink: "var(--ink)",
  inkSoft: "rgba(var(--ink-rgb), 0.62)",
  inkFaint: "rgba(var(--ink-rgb), 0.5)",
  inkFainter: "rgba(var(--ink-rgb), 0.35)",
  hairline: "rgba(var(--ink-rgb), 0.1)",
  onAccent: "var(--on-accent)",
  accent: "var(--accent)",
  accentPress: "var(--accent-press)",
  accentDark: "var(--accent-dark)",
  accentDeep: "var(--warn-text)",
  tint: "var(--tint)",
  tintWarm: "var(--tint-warm)",
  track: "var(--track)",
  trackAlt: "var(--track-alt)",
  sage: "var(--sage)",
  sageDark: "var(--sage-dark)",
  sageBg: "var(--sage-bg)",
  sageTrack: "var(--sage-track)",
  sageFill: "var(--sage-fill)",
  warnBg: "var(--warn-bg)",
  warnText: "var(--warn-text)",
  danger: "var(--danger)",
  dangerBg: "var(--danger-bg)"
};

export const fonts = {
  heading: "'Caprasimo', cursive",
  regular: "'Figtree', sans-serif",
  semibold: "'Figtree', sans-serif",
  bold: "'Figtree', sans-serif"
};

export const weights = {
  regular: 400,
  semibold: 600,
  bold: 700
};

export const radii = { sm: "16px", md: "22px", lg: "28px", pill: "999px" };
