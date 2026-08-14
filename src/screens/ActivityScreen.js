import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { fonts, radii } from "../theme";
import { useTheme } from "../context/ThemeContext";
import { useSpend, fmt } from "../context/SpendContext";
import { CATS } from "../data";
import Screen from "../components/Screen";

export default function ActivityScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { groups, totalSpent } = useSpend();
  const [filter, setFilter] = useState("all");

  const filters = [{ k: "all", n: "Everything" }, ...Object.keys(CATS).map((k) => ({ k, n: CATS[k].n }))];

  const filtered = useMemo(() => {
    return groups
      .map((g) => {
        const items = filter === "all" ? g.items : g.items.filter((t) => t.cat === filter);
        return { ...g, items, total: items.reduce((a, t) => a + t.amt, 0) };
      })
      .filter((g) => g.items.length);
  }, [groups, filter]);

  const txnCount = groups.reduce((a, g) => a + g.items.length, 0);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 28 }}>
        <View style={styles.header}>
          <Text style={styles.h1}>Activity</Text>
          <Text style={styles.sub}>
            {txnCount === 0 ? "No expenses logged yet" : `${fmt(totalSpent)} across ${txnCount} charge${txnCount === 1 ? "" : "s"}`}
          </Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}>
          {filters.map((f) => {
            const on = filter === f.k;
            return (
              <Pressable key={f.k} onPress={() => setFilter(f.k)} style={[styles.filterChip, on && styles.filterChipOn]}>
                <Text style={[styles.filterLabel, on && styles.filterLabelOn]}>{f.n}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={{ paddingHorizontal: 20, gap: 20, marginTop: 16 }}>
          {filtered.length === 0 && (
            <Text style={styles.emptyText}>
              {txnCount === 0 ? "Tap the + on Home to log your first expense." : "Nothing in this category yet."}
            </Text>
          )}
          {filtered.map((g) => (
            <View key={g.label}>
              <View style={styles.groupHead}>
                <Text style={styles.groupLabel}>{g.label.toUpperCase()}</Text>
                <Text style={styles.groupTotal}>{fmt(g.total)}</Text>
              </View>
              <View style={styles.card}>
                {g.items.map((t, i) => (
                  <View key={t.n + i} style={[styles.txRow, i > 0 && styles.txDivider]}>
                    <View style={[styles.avatar, { backgroundColor: CATS[t.cat].c }]}>
                      <Text style={styles.avatarText}>{t.n.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.txName} numberOfLines={1}>{t.n}</Text>
                      <Text style={styles.txMeta}>{CATS[t.cat].n} · {t.meta}</Text>
                    </View>
                    <Text style={styles.txAmt}>{fmt(t.amt)}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    header: { paddingHorizontal: 20, paddingTop: 8 },
    h1: { fontFamily: fonts.heading, fontSize: 27, color: colors.ink },
    sub: { fontFamily: fonts.regular, fontSize: 13, color: colors.inkSoft, marginTop: 4 },
    emptyText: { fontFamily: fonts.regular, fontSize: 13.5, color: colors.inkFaint, textAlign: "center", marginTop: 20 },
    filterRow: { marginTop: 18, flexGrow: 0 },
    filterChip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: radii.pill, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.hairline },
    filterChipOn: { backgroundColor: colors.ink, borderColor: colors.ink },
    filterLabel: { fontFamily: fonts.semibold, fontSize: 12.5, color: colors.ink },
    filterLabelOn: { color: colors.bg },
    groupHead: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
    groupLabel: { fontFamily: fonts.semibold, fontSize: 11, letterSpacing: 1.2, color: colors.inkFaint },
    groupTotal: { fontFamily: fonts.semibold, fontSize: 11, color: colors.inkFainter },
    card: { backgroundColor: colors.card, borderRadius: radii.md, overflow: "hidden" },
    txRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 13, paddingHorizontal: 16 },
    txDivider: { borderTopWidth: 1, borderTopColor: colors.hairline },
    avatar: { width: 36, height: 36, borderRadius: radii.pill, alignItems: "center", justifyContent: "center" },
    avatarText: { fontFamily: fonts.heading, fontSize: 14, color: colors.onAccent },
    txName: { fontFamily: fonts.semibold, fontSize: 14, color: colors.ink },
    txMeta: { fontFamily: fonts.regular, fontSize: 11.5, color: colors.inkFaint, marginTop: 2 },
    txAmt: { fontFamily: fonts.semibold, fontSize: 14, color: colors.ink }
  });
}
