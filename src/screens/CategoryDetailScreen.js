import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, fonts, radii } from "../theme";
import { useSpend, fmt } from "../context/SpendContext";
import { BASE_GROUPS, MONTHS_DATA } from "../data";
import ProgressBar from "../components/ProgressBar";

export default function CategoryDetailScreen({ route, navigation }) {
  const { catKey } = route.params;
  const { cats, spentByCat, budgets, extra } = useSpend();

  const c = cats[catKey];
  const s = spentByCat[catKey];
  const b = budgets[catKey];
  const pct = Math.min(s / b, 1);
  const over = s > b;

  const items = [];
  extra.forEach((t) => { if (t.cat === catKey) items.unshift({ n: t.n, amt: t.amt, meta: "Today · typed by you" }); });
  BASE_GROUPS.forEach((g) => g.items.forEach((t) => { if (t.cat === catKey) items.push({ n: t.n, amt: t.amt, meta: `${g.label.split(" · ")[0]} · ${t.meta}` }); }));

  const trendVals = [0.82, 1.04, 0.91, 1.12, 0.96, s / (b || 1)];
  const months = [...MONTHS_DATA.map((m) => m.m), "Aug"];

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color={colors.ink} />
        </Pressable>
        <Text style={styles.h1}>{c.n}</Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 28, gap: 18 }}>
        <View style={[styles.tintCard, { backgroundColor: colors.tint }]}>
          <Text style={styles.kicker}>Spent in August</Text>
          <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 10, marginTop: 8 }}>
            <Text style={styles.bigNum}>{fmt(s)}</Text>
            <Text style={styles.ofBudget}>of {fmt(b)} budgeted</Text>
          </View>
          <View style={{ marginTop: 16 }}>
            <ProgressBar pct={pct} color={c.c} bg="rgba(32,30,29,0.12)" height={11} />
          </View>
          <Text style={styles.tintLine}>
            {over
              ? `Over by ${fmt(s - b)}. Two smaller weeks and it evens out.`
              : `${fmt(b - s)} left, 19 days to go — about ${fmt((b - s) / 19)} a day.`}
          </Text>
        </View>

        <View>
          <Text style={styles.kicker}>Last six months</Text>
          <View style={styles.barsRow}>
            {months.map((m, i) => (
              <View key={m + i} style={styles.barCol}>
                <View style={[styles.bar, { height: `${Math.min(trendVals[i], 1.2) / 1.2 * 100}%`, backgroundColor: i === 5 ? c.c : colors.trackAlt }]} />
                <Text style={styles.barMonth}>{m}</Text>
              </View>
            ))}
          </View>
        </View>

        <View>
          <Text style={styles.kicker}>Every charge</Text>
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
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
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
  txRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 13, paddingHorizontal: 16 },
  txDivider: { borderTopWidth: 1, borderTopColor: colors.hairline },
  txName: { fontFamily: fonts.semibold, fontSize: 13.5, color: colors.ink },
  txMeta: { fontFamily: fonts.regular, fontSize: 11.5, color: colors.inkFaint, marginTop: 2 },
  txAmt: { fontFamily: fonts.semibold, fontSize: 13.5, color: colors.ink }
});
