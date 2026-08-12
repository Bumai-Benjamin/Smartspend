import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, fonts, radii } from "../theme";
import { useSpend, fmt, short } from "../context/SpendContext";
import ProgressBar from "../components/ProgressBar";
import HealthCard from "../components/HealthCard";
import Screen from "../components/Screen";

const MONTH_YEAR = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

export default function HomeScreen({ navigation }) {
  const {
    totalSpent, totalBudget, left, pace, heroLine, daysLeft, dayOfMonth, daysInMonth,
    catRows, addExpense, health, upcoming, upcomingTotal, displayName
  } = useSpend();

  const quickAdds = [
    { label: "Coffee $5.40", c: "#d67f48", cat: "food", amt: 5.4, n: "Coffee" },
    { label: "Transit $2.75", c: "#8c491a", cat: "trans", amt: 2.75, n: "Transit" },
    { label: "Lunch $14", c: "#f6a06b", cat: "food", amt: 14, n: "Lunch" }
  ];

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 28 }}>
        <View style={styles.header}>
          <View>
            <Text style={styles.kicker}>{MONTH_YEAR}</Text>
            <Text style={styles.h1}>Hey {displayName}</Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate("AddExpense")}
            style={({ pressed }) => [styles.addBtn, pressed && { backgroundColor: colors.accentPress }]}
          >
            <Feather name="plus" size={22} color={colors.card} />
          </Pressable>
        </View>

        <View style={styles.hero}>
          <Text style={styles.kicker}>Left to spend</Text>
          <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 10, marginTop: 8 }}>
            <Text style={styles.heroNum}>{fmt(left)}</Text>
            <Text style={styles.heroSub}>of {short(totalBudget)} · {daysLeft} days to go</Text>
          </View>
          <View style={{ marginTop: 18, marginBottom: 10 }}>
            <ProgressBar pct={pace} />
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.metaBold}>{fmt(totalSpent)} spent</Text>
            <Text style={styles.metaBold}>day {dayOfMonth} of {daysInMonth}</Text>
          </View>
          <View style={styles.heroDivider} />
          <Text style={styles.heroLine}>{heroLine}</Text>
        </View>

        <HealthCard health={health} onSetUp={() => navigation.getParent()?.navigate("Plan", { openHealthInputs: true })} />

        <View style={styles.section}>
          <Text style={styles.kicker}>One tap, done</Text>
          <View style={styles.chipsRow}>
            {quickAdds.map((q) => (
              <Pressable
                key={q.label}
                onPress={() => addExpense({ n: q.n, cat: q.cat, amt: q.amt })}
                style={({ pressed }) => [styles.pill, pressed && { backgroundColor: colors.cardPress }]}
              >
                <View style={[styles.dot, { backgroundColor: q.c }]} />
                <Text style={styles.pillLabel}>{q.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.h2}>Where it's going</Text>
            <Pressable onPress={() => navigation.getParent()?.navigate("Insights")}>
              <Text style={styles.link}>All categories</Text>
            </Pressable>
          </View>
          <View style={{ gap: 14, marginTop: 12 }}>
            {catRows.slice(0, 4).map((c) => (
              <Pressable key={c.k} onPress={() => navigation.navigate("CategoryDetail", { catKey: c.k })}>
                <View style={styles.rowBetween}>
                  <View style={styles.rowCenter}>
                    <View style={[styles.dotSm, { backgroundColor: c.c }]} />
                    <Text style={styles.rowLabel}>{c.n}</Text>
                  </View>
                  <Text style={styles.rowLabel}>{fmt(c.s)}</Text>
                </View>
                <View style={{ marginTop: 6 }}>
                  <ProgressBar pct={c.pct} color={c.c} bg="#e3d8c2" height={9} />
                </View>
                <Text style={styles.rowNote}>{c.note}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.upcoming}>
          <View style={styles.rowBetween}>
            <Text style={styles.upcomingTitle}>Coming out soon</Text>
            {upcoming.length > 0 && <Text style={styles.upcomingMeta}>{fmt(upcomingTotal)} left this month</Text>}
          </View>
          {upcoming.length === 0 ? (
            <Text style={styles.upcomingEmpty}>No recurring charges added yet. Add one on the Plan tab.</Text>
          ) : (
            <View style={{ gap: 11, marginTop: 12 }}>
              {upcoming.map((u) => (
                <View key={u.n} style={styles.rowCenter}>
                  <View style={styles.dayBadge}>
                    <Text style={styles.dayBadgeText}>{u.day}</Text>
                  </View>
                  <Text style={[styles.rowLabel, { flex: 1, color: "#272e1b" }]}>{u.n}</Text>
                  <Text style={styles.upcomingAmt}>{fmt(u.amt)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 8 },
  kicker: { fontFamily: fonts.regular, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: colors.inkFaint },
  h1: { fontFamily: fonts.heading, fontSize: 27, color: colors.ink, marginTop: 5 },
  h2: { fontFamily: fonts.heading, fontSize: 19, color: colors.ink },
  link: { fontFamily: fonts.semibold, fontSize: 12.5, color: colors.accentDark },
  addBtn: { width: 46, height: 46, borderRadius: radii.pill, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" },
  hero: { margin: 20, marginTop: 22, backgroundColor: colors.tint, borderRadius: radii.lg, padding: 22 },
  heroNum: { fontFamily: fonts.heading, fontSize: 46, letterSpacing: -1, color: colors.ink },
  heroSub: { fontFamily: fonts.semibold, fontSize: 12, color: colors.inkFaint, paddingBottom: 6 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  metaBold: { fontFamily: fonts.semibold, fontSize: 11, color: colors.inkFaint },
  heroDivider: { height: 1, backgroundColor: colors.hairline, marginTop: 16, marginBottom: 14 },
  heroLine: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: colors.ink },
  section: { paddingHorizontal: 20, marginTop: 6 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  pill: { flexDirection: "row", alignItems: "center", gap: 7, paddingVertical: 9, paddingLeft: 11, paddingRight: 14, borderRadius: radii.pill, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.hairline },
  pillLabel: { fontFamily: fonts.semibold, fontSize: 13, color: colors.ink },
  dot: { width: 9, height: 9, borderRadius: radii.pill },
  dotSm: { width: 10, height: 10, borderRadius: radii.pill, marginRight: 8 },
  rowCenter: { flexDirection: "row", alignItems: "center" },
  rowLabel: { fontFamily: fonts.semibold, fontSize: 14, color: colors.ink },
  rowNote: { fontFamily: fonts.regular, fontSize: 11, color: colors.inkFaint, marginTop: 5 },
  upcoming: { marginHorizontal: 20, marginTop: 20, marginBottom: 8, backgroundColor: colors.sageBg, borderRadius: radii.md, padding: 18 },
  upcomingTitle: { fontFamily: fonts.heading, fontSize: 16, color: colors.sageDark },
  upcomingMeta: { fontFamily: fonts.semibold, fontSize: 11, color: colors.sage },
  upcomingEmpty: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.sage, marginTop: 10, lineHeight: 18 },
  dayBadge: { width: 34, height: 34, borderRadius: radii.pill, backgroundColor: "#e1eecc", alignItems: "center", justifyContent: "center", marginRight: 11 },
  dayBadgeText: { fontFamily: fonts.semibold, fontSize: 12, color: colors.sageDark },
  upcomingAmt: { fontFamily: fonts.semibold, fontSize: 13, color: colors.sageDark }
});
