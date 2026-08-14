import React, { useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { fonts, radii } from "../theme";
import { useTheme } from "../context/ThemeContext";

export default function HealthCard({ health, onSetUp }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const STATUS_COLOR = { green: colors.sage, yellow: colors.accent, red: colors.danger };
  const { score, label, breakdown, biggestProblem, ready } = health;

  if (!ready) {
    return (
      <View style={styles.card}>
        <Text style={styles.kicker}>Financial health</Text>
        <Text style={styles.emptyTitle}>Add your income to see your score</Text>
        <Text style={styles.emptyBody}>
          Spending, savings, debt, emergency fund and cash flow all factor in — we just need your income first.
        </Text>
        {onSetUp && (
          <Pressable onPress={onSetUp} style={styles.setupBtn}>
            <Text style={styles.setupBtnText}>Set up income</Text>
          </Pressable>
        )}
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.kicker}>Financial health</Text>
      <View style={styles.scoreRow}>
        <Text style={styles.score}>{score}</Text>
        <Text style={styles.scoreMax}>/100</Text>
        <Text style={styles.scoreLabel}>— {label}</Text>
      </View>

      <View style={styles.rows}>
        {breakdown.map((b) => (
          <View key={b.k} style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.dot, { backgroundColor: STATUS_COLOR[b.status] }]} />
              <Text style={styles.rowLabel}>{b.label}</Text>
            </View>
            <Text style={[styles.rowWord, { color: STATUS_COLOR[b.status] }]}>{b.word}</Text>
          </View>
        ))}
      </View>

      {biggestProblem && (
        <View style={styles.callout}>
          <Text style={styles.calloutText}>{biggestProblem.text}</Text>
        </View>
      )}
    </View>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    card: { margin: 20, marginTop: 6, backgroundColor: colors.card, borderRadius: radii.lg, padding: 22, borderWidth: 1, borderColor: colors.hairline },
    kicker: { fontFamily: fonts.regular, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: colors.inkFaint },
    scoreRow: { flexDirection: "row", alignItems: "baseline", gap: 4, marginTop: 8 },
    score: { fontFamily: fonts.heading, fontSize: 40, letterSpacing: -1, color: colors.ink },
    scoreMax: { fontFamily: fonts.semibold, fontSize: 15, color: colors.inkFaint },
    scoreLabel: { fontFamily: fonts.semibold, fontSize: 15, color: colors.ink, marginLeft: 4 },
    rows: { marginTop: 18, gap: 12 },
    row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    rowLeft: { flexDirection: "row", alignItems: "center" },
    dot: { width: 10, height: 10, borderRadius: radii.pill, marginRight: 9 },
    rowLabel: { fontFamily: fonts.semibold, fontSize: 14, color: colors.ink },
    rowWord: { fontFamily: fonts.semibold, fontSize: 13 },
    callout: { marginTop: 18, backgroundColor: colors.warnBg, borderRadius: radii.md, padding: 14 },
    calloutText: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colors.warnText },
    emptyTitle: { fontFamily: fonts.heading, fontSize: 18, color: colors.ink, marginTop: 10 },
    emptyBody: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colors.inkSoft, marginTop: 8 },
    setupBtn: { marginTop: 16, alignSelf: "flex-start", backgroundColor: colors.accent, borderRadius: radii.pill, paddingVertical: 11, paddingHorizontal: 18 },
    setupBtnText: { fontFamily: fonts.heading, fontSize: 13, color: colors.onAccent }
  });
}
