import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { colors, fonts, radii } from "../theme";
import { useSpend, fmt, short } from "../context/SpendContext";
import { SUBS_DATA, GOALS } from "../data";
import ProgressBar from "../components/ProgressBar";

const TABS = [
  ["budgets", "Budgets"],
  ["subs", "Recurring"],
  ["goals", "Goals"]
];

export default function PlanScreen() {
  const { catRows, budgets, bumpBudget, allocated, totalBudget } = useSpend();
  const [tab, setTab] = useState("budgets");

  const subsTotal = SUBS_DATA.reduce((a, s) => a + s.amt, 0);

  const sub = tab === "budgets"
    ? "Nudge a number and the home screen follows."
    : tab === "subs"
    ? "Six charges that renew whether you look or not."
    : "Two things worth saving toward.";

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: 28 }}>
        <View style={styles.header}>
          <Text style={styles.h1}>Plan</Text>
          <Text style={styles.sub}>{sub}</Text>
        </View>

        <View style={styles.segWrap}>
          {TABS.map(([k, label]) => {
            const on = tab === k;
            return (
              <Pressable key={k} onPress={() => setTab(k)} style={[styles.segOpt, on && styles.segOptOn]}>
                <Text style={[styles.segLabel, on && styles.segLabelOn]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>

        {tab === "budgets" && (
          <View style={{ paddingHorizontal: 20, gap: 12, marginTop: 18 }}>
            {catRows.map((c) => (
              <View key={c.k} style={styles.budgetCard}>
                <View style={styles.rowCenter}>
                  <View style={[styles.dotSm, { backgroundColor: c.c }]} />
                  <Text style={[styles.rowLabel, { flex: 1 }]}>{c.n}</Text>
                  <Pressable onPress={() => bumpBudget(c.k, -10)} style={styles.stepBtn}>
                    <Text style={styles.stepBtnText}>{"\u2212"}</Text>
                  </Pressable>
                  <Text style={styles.budgetVal}>{short(budgets[c.k])}</Text>
                  <Pressable onPress={() => bumpBudget(c.k, 10)} style={styles.stepBtn}>
                    <Text style={styles.stepBtnText}>+</Text>
                  </Pressable>
                </View>
                <View style={{ marginTop: 12 }}>
                  <ProgressBar pct={c.pct} color={c.c} bg={colors.track} height={8} />
                </View>
                <Text style={[styles.budgetNote, c.over && { color: colors.accentDark }]}>{c.note}</Text>
              </View>
            ))}
            <View style={styles.allocatedCard}>
              <Text style={styles.allocatedLabel}>Allocated of {short(totalBudget)}</Text>
              <Text style={styles.allocatedVal}>{short(allocated)}</Text>
            </View>
          </View>
        )}

        {tab === "subs" && (
          <View style={{ paddingHorizontal: 20, gap: 12, marginTop: 18 }}>
            <View style={styles.subsHero}>
              <Text style={styles.kicker}>Recurring, every month</Text>
              <Text style={styles.subsTotal}>{fmt(subsTotal)}</Text>
              <Text style={styles.subsSub}>That's {short(subsTotal * 12)} a year, or one very good weekend.</Text>
            </View>
            {SUBS_DATA.map((s) => (
              <View key={s.n} style={styles.subRow}>
                <View style={[styles.avatar, { backgroundColor: s.c }]}>
                  <Text style={styles.avatarText}>{s.n.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowLabel}>{s.n}</Text>
                  <Text style={styles.txMeta}>{s.meta}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.rowLabel}>{fmt(s.amt)}</Text>
                  <Text style={styles.perMo}>/mo</Text>
                </View>
              </View>
            ))}
            <View style={styles.idleCard}>
              <Text style={styles.idleKicker}>IDLE SINCE JUNE</Text>
              <Text style={styles.idleText}>You've paid Ridge Gym $58 without going in. Pause it?</Text>
              <View style={{ flexDirection: "row", gap: 8, marginTop: 14 }}>
                <Pressable style={styles.pauseBtn}><Text style={styles.pauseBtnText}>Pause it</Text></Pressable>
                <Pressable style={styles.keepBtn}><Text style={styles.keepBtnText}>Keep it</Text></Pressable>
              </View>
            </View>
          </View>
        )}

        {tab === "goals" && (
          <View style={{ paddingHorizontal: 20, gap: 12, marginTop: 18 }}>
            {GOALS.map((g) => {
              const pct = g.saved / g.target;
              return (
                <View key={g.n} style={styles.goalCard}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.goalName}>{g.n}</Text>
                    <Text style={styles.goalPct}>{Math.round(pct * 100)}%</Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8, marginTop: 10 }}>
                    <Text style={styles.goalSaved}>{short(g.saved)}</Text>
                    <Text style={styles.goalTarget}>of {short(g.target)}</Text>
                  </View>
                  <View style={{ marginTop: 14 }}>
                    <ProgressBar pct={pct} color={colors.sageFill} bg={colors.sageTrack} height={10} />
                  </View>
                  <Text style={styles.goalNote}>{g.note}</Text>
                </View>
              );
            })}
          </View>
        )}
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
  rowCenter: { flexDirection: "row", alignItems: "center", gap: 10 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  rowLabel: { fontFamily: fonts.semibold, fontSize: 14, color: colors.ink },
  dotSm: { width: 10, height: 10, borderRadius: radii.pill },
  budgetCard: { backgroundColor: colors.card, borderRadius: radii.md, padding: 16 },
  stepBtn: { width: 30, height: 30, borderRadius: radii.pill, backgroundColor: colors.cardHover, alignItems: "center", justifyContent: "center" },
  stepBtnText: { fontFamily: fonts.semibold, fontSize: 16, color: colors.ink },
  budgetVal: { minWidth: 62, textAlign: "center", fontFamily: fonts.heading, fontSize: 16, color: colors.ink },
  budgetNote: { fontFamily: fonts.regular, fontSize: 11.5, color: colors.inkFaint, marginTop: 6 },
  allocatedCard: { backgroundColor: colors.tint, borderRadius: radii.md, padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  allocatedLabel: { fontFamily: fonts.semibold, fontSize: 13, color: colors.ink },
  allocatedVal: { fontFamily: fonts.heading, fontSize: 20, color: colors.ink },
  kicker: { fontFamily: fonts.regular, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: colors.inkSoft },
  subsHero: { backgroundColor: colors.tint, borderRadius: radii.lg, padding: 20 },
  subsTotal: { fontFamily: fonts.heading, fontSize: 34, color: colors.ink, marginTop: 8 },
  subsSub: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.inkSoft, marginTop: 6 },
  subRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.card, borderRadius: radii.md, padding: 15 },
  avatar: { width: 38, height: 38, borderRadius: radii.pill, alignItems: "center", justifyContent: "center" },
  avatarText: { fontFamily: fonts.heading, fontSize: 15, color: colors.card },
  txMeta: { fontFamily: fonts.regular, fontSize: 11.5, color: colors.inkFaint, marginTop: 2 },
  perMo: { fontFamily: fonts.regular, fontSize: 10.5, color: colors.inkFainter, marginTop: 4 },
  idleCard: { backgroundColor: colors.warnBg, borderRadius: radii.md, padding: 18 },
  idleKicker: { fontFamily: fonts.semibold, fontSize: 10.5, letterSpacing: 1.4, color: colors.accentDark },
  idleText: { fontFamily: fonts.heading, fontSize: 15, lineHeight: 20, color: colors.warnText, marginTop: 8 },
  pauseBtn: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: radii.pill, backgroundColor: colors.accent },
  pauseBtnText: { fontFamily: fonts.heading, fontSize: 13, color: colors.card },
  keepBtn: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: radii.pill, borderWidth: 1, borderColor: colors.hairline },
  keepBtnText: { fontFamily: fonts.heading, fontSize: 13, color: colors.ink },
  goalCard: { backgroundColor: colors.sageBg, borderRadius: radii.md, padding: 20 },
  goalName: { fontFamily: fonts.heading, fontSize: 18, color: colors.sageDark },
  goalPct: { fontFamily: fonts.semibold, fontSize: 12, color: colors.sage },
  goalSaved: { fontFamily: fonts.heading, fontSize: 30, color: colors.sageDark },
  goalTarget: { fontFamily: fonts.semibold, fontSize: 12, color: colors.sage, paddingBottom: 4 },
  goalNote: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 17, color: "#3d472b", marginTop: 10 }
});
