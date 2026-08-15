import React, { useMemo } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { fonts, radii } from "../theme";
import { useTheme } from "../context/ThemeContext";
import { useSpend, fmt } from "../context/SpendContext";
import ProgressBar from "../components/ProgressBar";
import Screen from "../components/Screen";

export default function CategoryDetailScreen({ route, navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { catKey } = route.params;
  const { cats, spentByCat, budgets, transactions, monthlyTotalsByCat, daysLeft } = useSpend();

  const c = cats[catKey];
  const s = spentByCat[catKey] || 0;
  const b = budgets[catKey] || 0;
  const pct = b ? Math.min(s / b, 1) : 0;
  const over = s > b;

  const items = transactions
    .filter((t) => t.cat === catKey)
    .map((t) => ({
      n: t.n,
      amt: t.amt,
      meta: `${t.occurred_at.toLocaleDateString("en-US", { month: "short", day: "numeric" })}${t.meta ? ` · ${t.meta}` : ""}`
    }));

  const trend = monthlyTotalsByCat[catKey] || [];
  const maxTrend = Math.max(...trend.map((m) => m.v), b, 1);

  return (
    <Screen edges={["top", "bottom", "left", "right"]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color={colors.ink} />
        </Pressable>
        <Text style={styles.h1}>{c.n}</Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 28, gap: 18 }}>
        <View style={[styles.tintCard, { backgroundColor: colors.tint }]}>
          <Text style={styles.kicker}>Spent this month</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "flex-end", gap: 10, marginTop: 8 }}>
            <Text style={styles.bigNum}>{fmt(s)}</Text>
            <Text style={styles.ofBudget}>{b ? `of ${fmt(b)} budgeted` : "no budget set"}</Text>
          </View>
          <View style={{ marginTop: 16 }}>
            <ProgressBar pct={pct} color={c.c} bg={colors.tintTrack} height={11} />
          </View>
          <Text style={styles.tintLine}>
            {!b
              ? "Set a budget for this category on the Plan tab."
              : over
              ? `Over by ${fmt(s - b)}.`
              : daysLeft > 0
              ? `${fmt(b - s)} left, ${daysLeft} day${daysLeft === 1 ? "" : "s"} to go — about ${fmt((b - s) / daysLeft)} a day.`
              : `${fmt(b - s)} left this month.`}
          </Text>
        </View>

        <View>
          <Text style={styles.kicker}>Last six months</Text>
          <View style={styles.barsRow}>
            {trend.map((m, i) => (
              <View key={m.m + i} style={styles.barCol}>
                <View style={[styles.bar, { height: `${(m.v / maxTrend) * 100}%`, backgroundColor: m.current ? c.c : colors.trackAlt }]} />
                <Text style={styles.barMonth}>{m.m}</Text>
              </View>
            ))}
          </View>
        </View>

        <View>
          <Text style={styles.kicker}>Every charge</Text>
          {items.length === 0 ? (
            <Text style={styles.emptyText}>Nothing logged in this category yet.</Text>
          ) : (
            <View style={styles.card}>
              {items.map((t, i) => (
                <View key={t.n + i} style={[styles.txRow, i > 0 && styles.txDivider]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.txName}>{t.n}</Text>
                    <Text style={styles.txMeta}>{t.meta}</Text>
                  </View>
                  <Text style={styles.txAmt}>{fmt(t.amt)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14 },
    backBtn: { width: 38, height: 38, borderRadius: radii.pill, backgroundColor: colors.tint, alignItems: "center", justifyContent: "center" },
    h1: { fontFamily: fonts.heading, fontSize: 20, color: colors.ink },
    kicker: { fontFamily: fonts.regular, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: colors.inkFaint, marginBottom: 10 },
    tintCard: { borderRadius: radii.lg, padding: 22 },
    bigNum: { fontFamily: fonts.heading, fontSize: 40, color: colors.ink },
    ofBudget: { fontFamily: fonts.semibold, fontSize: 12, color: colors.inkFaint, paddingBottom: 6 },
    tintLine: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: colors.ink, marginTop: 12 },
    barsRow: { flexDirection: "row", alignItems: "flex-end", gap: 9, height: 92 },
    barCol: { flex: 1, alignItems: "center", height: "100%", justifyContent: "flex-end", gap: 6 },
    bar: { width: "100%", borderRadius: 6, minHeight: 4 },
    barMonth: { fontFamily: fonts.semibold, fontSize: 10, color: colors.inkFaint },
    card: { backgroundColor: colors.card, borderRadius: radii.md, overflow: "hidden" },
    emptyText: { fontFamily: fonts.regular, fontSize: 13, color: colors.inkFaint },
    txRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 13, paddingHorizontal: 16 },
    txDivider: { borderTopWidth: 1, borderTopColor: colors.hairline },
    txName: { fontFamily: fonts.semibold, fontSize: 13.5, color: colors.ink },
    txMeta: { fontFamily: fonts.regular, fontSize: 11.5, color: colors.inkFaint, marginTop: 2 },
    txAmt: { fontFamily: fonts.semibold, fontSize: 13.5, color: colors.ink }
  });
}
