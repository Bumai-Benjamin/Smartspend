import React, { useState, useEffect, useMemo } from "react";
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";
import { Feather } from "@expo/vector-icons";
import { fonts, radii } from "../theme";
import { useTheme } from "../context/ThemeContext";
import { useSpend, fmt, short } from "../context/SpendContext";
import ProgressBar from "../components/ProgressBar";
import Screen from "../components/Screen";

const TABS = [
  ["budgets", "Budgets"],
  ["subs", "Recurring"],
  ["goals", "Goals"],
  ["health", "Health"]
];

export default function PlanScreen({ route }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const {
    catRows, budgets, setBudgetAmount, allocated, totalBudget,
    subscriptions, addSubscription, deleteSubscription,
    emergencyFund, updateEmergencyFund,
    healthInputs, updateHealthInputs
  } = useSpend();
  const [tab, setTab] = useState("budgets");

  useEffect(() => {
    if (route?.params?.openHealthInputs) setTab("health");
  }, [route?.params?.openHealthInputs]);

  const subsTotal = subscriptions.reduce((a, s) => a + s.amount, 0);

  const sub = tab === "budgets"
    ? "Nudge a number and the home screen follows."
    : tab === "subs"
    ? "Recurring charges you've told us about."
    : tab === "goals"
    ? "What you're saving toward."
    : "Manual figures behind your Financial Health score.";

  return (
    <Screen>
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
              <BudgetSliderRow
                key={c.k}
                c={c}
                budget={budgets[c.k] || 0}
                onCommit={(v) => setBudgetAmount(c.k, v)}
              />
            ))}
            <View style={styles.allocatedCard}>
              <Text style={styles.allocatedLabel}>Allocated</Text>
              <Text style={styles.allocatedVal}>{short(allocated)}</Text>
            </View>
          </View>
        )}

        {tab === "subs" && (
          <SubsTab subscriptions={subscriptions} subsTotal={subsTotal} addSubscription={addSubscription} deleteSubscription={deleteSubscription} />
        )}

        {tab === "goals" && (
          <View style={{ paddingHorizontal: 20, gap: 12, marginTop: 18 }}>
            {emergencyFund ? (
              <GoalCard goal={emergencyFund} />
            ) : (
              <Text style={styles.emptyText}>No goals yet.</Text>
            )}
            <Text style={styles.helperText}>Update your emergency fund on the Health tab.</Text>
          </View>
        )}

        {tab === "health" && (
          <HealthTab
            healthInputs={healthInputs}
            updateHealthInputs={updateHealthInputs}
            emergencyFund={emergencyFund}
            updateEmergencyFund={updateEmergencyFund}
          />
        )}
      </ScrollView>
    </Screen>
  );
}

function BudgetSliderRow({ c, budget, onCommit }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [localValue, setLocalValue] = useState(budget);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(budget ? String(budget) : "");
  useEffect(() => { setLocalValue(budget); }, [budget]);

  const sliderMax = Math.max(c.max || 1000, Math.ceil(((localValue || 0) * 1.2 || 100) / 100) * 100);

  const pct = localValue ? Math.min(c.s / localValue, 1) : 0;
  const note = !localValue
    ? "No budget set yet"
    : c.s > localValue
    ? `${fmt(c.s - localValue)} over its ${short(localValue)} budget`
    : localValue - c.s < localValue * 0.15
    ? `${fmt(localValue - c.s)} left — getting thin`
    : `${fmt(localValue - c.s)} left of ${short(localValue)}`;

  function startEdit() {
    setDraft(localValue ? String(localValue) : "");
    setEditing(true);
  }

  function commitDraft() {
    setEditing(false);
    const next = Math.max(0, Math.round(parseFloat(draft) || 0));
    setLocalValue(next);
    onCommit(next);
  }

  return (
    <View style={styles.budgetCard}>
      <View style={styles.rowCenter}>
        <View style={[styles.dotSm, { backgroundColor: c.c }]} />
        <Text style={[styles.rowLabel, { flex: 1 }]}>{c.n}</Text>
        {editing ? (
          <TextInput
            style={styles.budgetValInput}
            value={draft}
            onChangeText={setDraft}
            onBlur={commitDraft}
            onSubmitEditing={commitDraft}
            keyboardType="decimal-pad"
            autoFocus
          />
        ) : (
          <Pressable onPress={startEdit}>
            <Text style={styles.budgetVal}>{short(localValue)}</Text>
          </Pressable>
        )}
      </View>
      <Slider
        style={{ marginTop: 10, height: 32 }}
        value={budget}
        minimumValue={0}
        maximumValue={sliderMax}
        step={5}
        minimumTrackTintColor={c.c}
        maximumTrackTintColor={colors.track}
        thumbTintColor={c.c}
        onValueChange={setLocalValue}
        onSlidingComplete={onCommit}
      />
      <View style={{ marginTop: 8 }}>
        <ProgressBar pct={pct} color={c.c} bg={colors.track} height={8} />
      </View>
      <Text style={[styles.budgetNote, c.s > localValue && { color: colors.accentDark }]}>{note}</Text>
    </View>
  );
}

function GoalCard({ goal }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const pct = goal.target ? goal.saved / goal.target : 0;
  return (
    <View style={styles.goalCard}>
      <View style={styles.rowBetween}>
        <Text style={styles.goalName}>{goal.name}</Text>
        <Text style={styles.goalPct}>{Math.round(pct * 100)}%</Text>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "flex-end", gap: 8, marginTop: 10 }}>
        <Text style={styles.goalSaved}>{short(goal.saved)}</Text>
        <Text style={styles.goalTarget}>of {short(goal.target)}</Text>
      </View>
      <View style={{ marginTop: 14 }}>
        <ProgressBar pct={pct} color={colors.sageFill} bg={colors.sageTrack} height={10} />
      </View>
    </View>
  );
}

function SubsTab({ subscriptions, subsTotal, addSubscription, deleteSubscription }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [amt, setAmt] = useState("");
  const [day, setDay] = useState("");

  function save() {
    const amount = parseFloat(amt);
    const chargeDay = parseInt(day, 10);
    if (!name.trim() || !amount || !chargeDay || chargeDay < 1 || chargeDay > 31) return;
    addSubscription({ name: name.trim(), amount, next_charge_day: chargeDay });
    setName(""); setAmt(""); setDay(""); setAdding(false);
  }

  return (
    <View style={{ paddingHorizontal: 20, gap: 12, marginTop: 18 }}>
      <View style={styles.subsHero}>
        <Text style={styles.kicker}>Recurring, every month</Text>
        <Text style={styles.subsTotal}>{fmt(subsTotal)}</Text>
        <Text style={styles.subsSub}>That's {short(subsTotal * 12)} a year.</Text>
      </View>

      {subscriptions.length === 0 && !adding && (
        <Text style={styles.emptyText}>No recurring charges added yet.</Text>
      )}

      {subscriptions.map((s) => (
        <View key={s.id} style={styles.subRow}>
          <View style={[styles.avatar, { backgroundColor: s.color || colors.accent }]}>
            <Text style={styles.avatarText}>{s.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>{s.name}</Text>
            <Text style={styles.txMeta}>Charges on the {s.next_charge_day}{s.note ? ` · ${s.note}` : ""}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.rowLabel}>{fmt(s.amount)}</Text>
            <Text style={styles.perMo}>/mo</Text>
          </View>
          <Pressable onPress={() => deleteSubscription(s.id)} style={styles.deleteBtn}>
            <Feather name="trash-2" size={15} color={colors.inkFaint} />
          </Pressable>
        </View>
      ))}

      {adding ? (
        <View style={styles.addCard}>
          <TextInput style={styles.addInput} placeholder="Name" placeholderTextColor={colors.inkFainter} value={name} onChangeText={setName} />
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TextInput style={[styles.addInput, { flex: 1 }]} placeholder="Amount" placeholderTextColor={colors.inkFainter} value={amt} onChangeText={setAmt} keyboardType="decimal-pad" />
            <TextInput style={[styles.addInput, { flex: 1 }]} placeholder="Day (1-31)" placeholderTextColor={colors.inkFainter} value={day} onChangeText={setDay} keyboardType="number-pad" />
          </View>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
            <Pressable style={styles.pauseBtn} onPress={save}><Text style={styles.pauseBtnText}>Save</Text></Pressable>
            <Pressable style={styles.keepBtn} onPress={() => setAdding(false)}><Text style={styles.keepBtnText}>Cancel</Text></Pressable>
          </View>
        </View>
      ) : (
        <Pressable style={styles.addRowBtn} onPress={() => setAdding(true)}>
          <Feather name="plus" size={16} color={colors.accentDark} />
          <Text style={styles.addRowBtnText}>Add a recurring charge</Text>
        </Pressable>
      )}
    </View>
  );
}

function NumberField({ label, value, onCommit, prefix = "$" }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [text, setText] = useState(value ? String(value) : "");
  useEffect(() => { setText(value ? String(value) : ""); }, [value]);
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldInputWrap}>
        <Text style={styles.fieldPrefix}>{prefix}</Text>
        <TextInput
          style={styles.fieldInput}
          value={text}
          onChangeText={setText}
          onEndEditing={() => onCommit(parseFloat(text) || 0)}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={colors.inkFainter}
        />
      </View>
    </View>
  );
}

function HealthTab({ healthInputs, updateHealthInputs, emergencyFund, updateEmergencyFund }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={{ paddingHorizontal: 20, gap: 20, marginTop: 18 }}>
      <View style={styles.healthCard}>
        <Text style={styles.kicker}>Income & savings</Text>
        <View style={{ marginTop: 12, gap: 14 }}>
          <NumberField label="Monthly income" value={healthInputs?.income} onCommit={(v) => updateHealthInputs({ income: v })} />
          <NumberField label="Saved this month" value={healthInputs?.savings_this_month} onCommit={(v) => updateHealthInputs({ savings_this_month: v })} />
        </View>
      </View>

      <View style={styles.healthCard}>
        <Text style={styles.kicker}>Debt</Text>
        <View style={{ marginTop: 12, gap: 14 }}>
          <NumberField label="Current balance" value={healthInputs?.debt_balance} onCommit={(v) => updateHealthInputs({ debt_balance: v })} />
        </View>
      </View>

      <View style={styles.healthCard}>
        <Text style={styles.kicker}>Emergency fund</Text>
        <View style={{ marginTop: 12, gap: 14 }}>
          <NumberField label="Saved so far" value={emergencyFund?.saved} onCommit={(v) => updateEmergencyFund({ saved: v })} />
          <NumberField label="Target" value={emergencyFund?.target} onCommit={(v) => updateEmergencyFund({ target: v })} />
        </View>
      </View>
    </View>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
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
    budgetVal: { minWidth: 62, textAlign: "right", fontFamily: fonts.heading, fontSize: 16, color: colors.ink },
    budgetValInput: { minWidth: 90, textAlign: "right", fontFamily: fonts.heading, fontSize: 16, color: colors.ink, backgroundColor: colors.bg, borderWidth: 1.5, borderColor: colors.accent, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
    budgetNote: { fontFamily: fonts.regular, fontSize: 11.5, color: colors.inkFaint, marginTop: 6 },
    allocatedCard: { backgroundColor: colors.tint, borderRadius: radii.md, padding: 16, flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", alignItems: "baseline" },
    allocatedLabel: { fontFamily: fonts.semibold, fontSize: 13, color: colors.ink },
    allocatedVal: { fontFamily: fonts.heading, fontSize: 20, color: colors.ink },
    kicker: { fontFamily: fonts.regular, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: colors.inkSoft },
    subsHero: { backgroundColor: colors.tint, borderRadius: radii.lg, padding: 20 },
    subsTotal: { fontFamily: fonts.heading, fontSize: 34, color: colors.ink, marginTop: 8 },
    subsSub: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.inkSoft, marginTop: 6 },
    subRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.card, borderRadius: radii.md, padding: 15 },
    avatar: { width: 38, height: 38, borderRadius: radii.pill, alignItems: "center", justifyContent: "center" },
    avatarText: { fontFamily: fonts.heading, fontSize: 15, color: colors.onAccent },
    txMeta: { fontFamily: fonts.regular, fontSize: 11.5, color: colors.inkFaint, marginTop: 2 },
    perMo: { fontFamily: fonts.regular, fontSize: 10.5, color: colors.inkFainter, marginTop: 4 },
    deleteBtn: { padding: 6, marginLeft: 4 },
    emptyText: { fontFamily: fonts.regular, fontSize: 13, color: colors.inkFaint, textAlign: "center", marginTop: 8 },
    helperText: { fontFamily: fonts.regular, fontSize: 12, color: colors.inkFaint, textAlign: "center", marginTop: 4 },
    addRowBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: radii.md, borderWidth: 1, borderColor: colors.hairline, borderStyle: "dashed" },
    addRowBtnText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.accentDark },
    addCard: { backgroundColor: colors.card, borderRadius: radii.md, padding: 16, gap: 10 },
    addInput: { backgroundColor: colors.bg, borderRadius: radii.sm, borderWidth: 1, borderColor: colors.hairline, paddingVertical: 11, paddingHorizontal: 13, fontFamily: fonts.regular, fontSize: 14, color: colors.ink },
    pauseBtn: { flex: 1, paddingVertical: 10, borderRadius: radii.pill, backgroundColor: colors.accent, alignItems: "center" },
    pauseBtnText: { fontFamily: fonts.heading, fontSize: 13, color: colors.onAccent },
    keepBtn: { flex: 1, paddingVertical: 10, borderRadius: radii.pill, borderWidth: 1, borderColor: colors.hairline, alignItems: "center" },
    keepBtnText: { fontFamily: fonts.heading, fontSize: 13, color: colors.ink },
    goalCard: { backgroundColor: colors.sageBg, borderRadius: radii.md, padding: 20 },
    goalName: { fontFamily: fonts.heading, fontSize: 18, color: colors.sageDark },
    goalPct: { fontFamily: fonts.semibold, fontSize: 12, color: colors.sage },
    goalSaved: { fontFamily: fonts.heading, fontSize: 30, color: colors.sageDark },
    goalTarget: { fontFamily: fonts.semibold, fontSize: 12, color: colors.sage, paddingBottom: 4 },
    healthCard: { backgroundColor: colors.card, borderRadius: radii.lg, padding: 18 },
    fieldRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
    fieldLabel: { flex: 1, fontFamily: fonts.semibold, fontSize: 13.5, color: colors.ink },
    fieldInputWrap: { flexDirection: "row", alignItems: "center", backgroundColor: colors.bg, borderRadius: radii.sm, borderWidth: 1, borderColor: colors.hairline, paddingHorizontal: 12, paddingVertical: 8, minWidth: 110 },
    fieldPrefix: { fontFamily: fonts.semibold, fontSize: 14, color: colors.inkFaint, marginRight: 4 },
    fieldInput: { flex: 1, fontFamily: fonts.semibold, fontSize: 14, color: colors.ink, padding: 0, textAlign: "right" }
  });
}
