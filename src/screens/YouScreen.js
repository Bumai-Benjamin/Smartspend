import React from "react";
import { View, Text, ScrollView, Pressable, Switch, StyleSheet } from "react-native";
import { colors, fonts, radii } from "../theme";
import { useSpend } from "../context/SpendContext";
import { SOURCES } from "../data";

export default function YouScreen() {
  const { prefs, togglePref } = useSpend();

  const prefRows = [
    ["nudges", "Gentle nudges", "A poke when a category is nearly empty"],
    ["weekly", "Sunday recap", "One card, 20 seconds, no spreadsheet"],
    ["round", "Round-ups to savings", "Spare change lands in Emergency fund"],
    ["faceid", "Face ID to open", "Because rent is nobody else's business"]
  ];

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: 28 }}>
        <View style={styles.profileRow}>
          <View style={styles.avatar}><Text style={styles.avatarText}>B</Text></View>
          <View>
            <Text style={styles.name}>Ben Bumai</Text>
            <Text style={styles.sub}>Freelance · 8 months of history</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.kicker}>Where money comes in from</Text>
          <View style={{ gap: 12, marginTop: 14 }}>
            {SOURCES.map((s) => (
              <View key={s.n} style={styles.sourceRow}>
                <View style={[styles.dotSm, { backgroundColor: s.dot }]} />
                <Text style={[styles.sourceName, { flex: 1 }]}>{s.n}</Text>
                <Text style={styles.sourceMeta}>{s.meta}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.card, { padding: 0, overflow: "hidden" }]}>
          {prefRows.map(([key, n, meta], i) => (
            <View key={key} style={[styles.prefRow, i > 0 && styles.prefDivider]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sourceName}>{n}</Text>
                <Text style={styles.txMeta}>{meta}</Text>
              </View>
              <Switch
                value={prefs[key]}
                onValueChange={() => togglePref(key)}
                trackColor={{ false: colors.trackAlt, true: colors.accent }}
                thumbColor={colors.card}
              />
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>SmartSpend 1.0 · your data never leaves the phone unless you sync it.</Text>
          <Pressable><Text style={styles.exportLink}>Export this month as CSV</Text></Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  profileRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 20, paddingTop: 8 },
  avatar: { width: 62, height: 62, borderRadius: radii.pill, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" },
  avatarText: { fontFamily: fonts.heading, fontSize: 24, color: colors.card },
  name: { fontFamily: fonts.heading, fontSize: 24, color: colors.ink },
  sub: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.inkSoft, marginTop: 3 },
  card: { marginHorizontal: 20, marginTop: 20, backgroundColor: colors.card, borderRadius: radii.md, padding: 18 },
  kicker: { fontFamily: fonts.regular, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: colors.inkFaint },
  sourceRow: { flexDirection: "row", alignItems: "center", gap: 11 },
  dotSm: { width: 8, height: 8, borderRadius: radii.pill },
  sourceName: { fontFamily: fonts.semibold, fontSize: 13.5, color: colors.ink },
  sourceMeta: { fontFamily: fonts.regular, fontSize: 11.5, color: colors.inkFaint },
  prefRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 15, paddingHorizontal: 18 },
  prefDivider: { borderTopWidth: 1, borderTopColor: colors.hairline },
  txMeta: { fontFamily: fonts.regular, fontSize: 11.5, color: colors.inkFaint, marginTop: 2 },
  footer: { paddingHorizontal: 20, paddingTop: 24, gap: 9 },
  footerText: { fontFamily: fonts.regular, fontSize: 12, color: colors.inkFaint },
  exportLink: { fontFamily: fonts.semibold, fontSize: 13, color: colors.accentDark }
});
