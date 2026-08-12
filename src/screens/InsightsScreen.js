import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { colors, fonts, radii } from "../theme";
import { useSpend, fmt, short } from "../context/SpendContext";
import { MONTHS_DATA, CAL_AMTS, TAKEAWAYS } from "../data";
import DonutChart from "../components/DonutChart";

const VIZ = [
  ["rings", "Rings"],
  ["spine", "Six months"],
  ["cal", "Calendar"]
];

function bucket(v) {
  if (v === 0) return { bg: "#efe4d0", fg: "rgba(32,30,29,0.35)" };
  if (v < 40) return { bg: "#ffe1d0", fg: "#8c491a" };
  if (v < 100) return { bg: "#ffc6a5", fg: "#643312" };
  if (v < 200) return { bg: "#f6a06b", fg: "#402310" };
  return { bg: "#c67139", fg: "#fff2eb" };
}

export default function InsightsScreen() {
  const { catRows, totalSpent, dayOfMonth } = useSpend();
  const [viz, setViz] = useState("rings");

  const segments = catRows.map((c) => ({ color: c.c, value: c.s }));
  const legend = catRows.slice(0, 5).map((c) => ({ ...c, share: Math.round((c.s / totalSpent) * 100) }));

  const maxMonth = 2700;
  const months = [...MONTHS_DATA, { m: "Aug", v: totalSpent, current: true }];
  const forecast = totalSpent + (Math.max(2400 - totalSpent, 0) / 19) * 19 * 0.92;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: 28 }}>
        <View style={styles.header}>
          <Text style={styles.h1}>Insights</Text>
          <Text style={styles.sub}>Same month, three ways to read it.</Text>
        </View>

        <View style={styles.segWrap}>
          {VIZ.map(([k, label]) => {
            const on = viz === k;
            return (
              <Pressable key={k} onPress={() => setViz(k)} style={[styles.segOpt, on && styles.segOptOn]}>
                <Text style={[styles.segLabel, on && styles.segLabelOn]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>

        {viz === "rings" && (
          <View style={styles.card}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
              <DonutChart segments={segments} centerLabel={short(totalSpent)} centerSub="spent" />
              <View style={{ flex: 1, gap: 9 }}>
                {legend.map((l) => (
                  <View key={l.k} style={styles.legendRow}>
                    <View style={[styles.dotSm, { backgroundColor: l.c }]} />
                    <Text style={styles.legendName} numberOfLines={1}>{l.n}</Text>
                    <Text style={styles.legendShare}>{l.share}%</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {viz === "spine" && (
          <View style={styles.card}>
            <Text style={styles.kicker}>Six months</Text>
            <View style={styles.barsRow}>
              {months.map((m) => (
                <View key={m.m} style={styles.barCol}>
                  <Text style={styles.barAmt}>{short(m.v)}</Text>
                  <View style={[styles.bar, { height: `${(m.v / maxMonth) * 100}%`, backgroundColor: m.current ? colors.accent : colors.trackAlt }]} />
                  <Text style={[styles.barMonth, m.current && { color: colors.accentDark }]}>{m.m}</Text>
                </View>
              ))}
            </View>
            <View style={styles.hr} />
            <Text style={styles.cardNote}>
              Dashed bar is August so far. On this pace you land near <Text style={{ fontFamily: fonts.bold, color: colors.ink }}>{short(forecast)}</Text> — your calmest month since March.
            </Text>
          </View>
        )}

        {viz === "cal" && (
          <View style={styles.card}>
            <View style={styles.calGrid}>
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <Text key={i} style={styles.calHead}>{d}</Text>
              ))}
            </View>
            <View style={styles.calGrid}>
              {Array.from({ length: 6 }).map((_, i) => (
                <View key={"pad" + i} style={styles.calCell} />
              ))}
              {Array.from({ length: 31 }).map((_, i) => {
                const day = i + 1;
                const future = day > dayOfMonth;
                const v = future ? 0 : CAL_AMTS[day - 1] || 0;
                const b = future ? { bg: "transparent", fg: "rgba(32,30,29,0.28)" } : bucket(v);
                return (
                  <View
                    key={day}
                    style={[
                      styles.calCell,
                      { backgroundColor: b.bg, borderWidth: future ? 1 : 0, borderColor: "rgba(32,30,29,0.16)", borderStyle: future ? "dashed" : "solid" }
                    ]}
                  >
                    <Text style={[styles.calDay, { color: b.fg }]}>{day}</Text>
                    {!future && <Text style={[styles.calTick, { color: b.fg }]}>{v ? Math.round(v) : "·"}</Text>}
                  </View>
                );
              })}
            </View>
            <Text style={styles.cardNote}>Darker is heavier. The 10th is rent; the other dark patch is a Friday habit worth <Text style={{ fontFamily: fonts.bold, color: colors.ink }}>$154</Text> a month.</Text>
          </View>
        )}

        <View style={{ paddingHorizontal: 20, gap: 12, marginTop: 20 }}>
          {TAKEAWAYS.map((t) => (
            <View key={t.kicker} style={[styles.takeaway, { backgroundColor: t.bg }]}>
              <Text style={[styles.takeawayKicker, { color: t.kc }]}>{t.kicker.toUpperCase()}</Text>
              <Text style={[styles.takeawayText, { color: t.tc }]}>{t.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 20, paddingTop: 8 },
  h1: { fontFamily: fonts.heading, fontSize: 27, color: colors.ink },
  sub: { fontFamily: fonts.regular, fontSize: 13, color: colors.inkSoft, marginTop: 4 },
  segWrap: { flexDirection: "row", gap: 4, padding: 4, backgroundColor: colors.track, borderRadius: radii.pill, marginHorizontal: 20, marginTop: 18 },
  segOpt: { flex: 1, alignItems: "center", paddingVertical: 9, borderRadius: radii.pill },
  segOptOn: { backgroundColor: colors.bg },
  segLabel: { fontFamily: fonts.semibold, fontSize: 12.5, color: colors.inkSoft },
  segLabelOn: { color: colors.ink },
  card: { marginHorizontal: 20, marginTop: 20, backgroundColor: colors.card, borderRadius: radii.lg, padding: 22 },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  legendName: { flex: 1, fontFamily: fonts.semibold, fontSize: 12, color: colors.ink },
  legendShare: { fontFamily: fonts.semibold, fontSize: 12, color: colors.inkFaint },
  dotSm: { width: 9, height: 9, borderRadius: radii.pill },
  kicker: { fontFamily: fonts.regular, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: colors.inkFaint },
  barsRow: { flexDirection: "row", alignItems: "flex-end", gap: 10, height: 150, marginTop: 16 },
  barCol: { flex: 1, alignItems: "center", height: "100%", justifyContent: "flex-end", gap: 7 },
  bar: { width: "100%", borderRadius: 8, minHeight: 4 },
  barAmt: { fontFamily: fonts.semibold, fontSize: 10, color: colors.inkFaint },
  barMonth: { fontFamily: fonts.semibold, fontSize: 11, color: colors.inkFaint },
  hr: { height: 1, backgroundColor: colors.hairline, marginTop: 14, marginBottom: 14 },
  cardNote: { fontFamily: fonts.regular, fontSize: 12.5, lineHeight: 18, color: colors.inkSoft },
  calGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 6 },
  calHead: { width: "12%", textAlign: "center", fontFamily: fonts.semibold, fontSize: 10, color: colors.inkFaint },
  calCell: { width: "12%", aspectRatio: 1, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  calDay: { fontFamily: fonts.semibold, fontSize: 10 },
  calTick: { fontFamily: fonts.regular, fontSize: 8 },
  takeaway: { borderRadius: radii.md, padding: 18 },
  takeawayKicker: { fontFamily: fonts.semibold, fontSize: 10.5, letterSpacing: 1.4 },
  takeawayText: { fontFamily: fonts.heading, fontSize: 15, lineHeight: 20, marginTop: 8 }
});
