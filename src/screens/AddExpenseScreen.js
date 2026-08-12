import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, radii } from "../theme";
import { useSpend, fmt, guessCat, parseAmt, cleanLabel } from "../context/SpendContext";
import { TABLET_BREAKPOINT, MAX_CONTENT_WIDTH } from "../components/Screen";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "\u232b"];

export default function AddExpenseScreen({ navigation }) {
  const { cats, addExpense } = useSpend();
  const [mode, setMode] = useState("numpad");
  const [amt, setAmt] = useState("");
  const [cat, setCat] = useState("food");
  const [typedText, setTypedText] = useState("");
  const [typedCatOverride, setTypedCatOverride] = useState(null);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWide = width >= TABLET_BREAKPOINT;

  const catKeys = Object.keys(cats);
  const amtNum = parseFloat(amt || "0") || 0;
  const typedCat = typedCatOverride || guessCat(typedText);
  const typedAmt = parseAmt(typedText);
  const isType = mode === "type";
  const activeAmt = isType ? typedAmt : amtNum;
  const activeCat = isType ? typedCat : cat;

  function press(k) {
    if (k === "\u232b") { setAmt((a) => a.slice(0, -1)); return; }
    if (k === ".") { setAmt((a) => (a.indexOf(".") >= 0 ? a : (a || "0") + ".")); return; }
    setAmt((a) => {
      if (a.indexOf(".") >= 0 && a.split(".")[1].length >= 2) return a;
      return (a === "0" ? "" : a) + k;
    });
  }

  function cycleTypedCat() {
    const i = catKeys.indexOf(typedCat);
    setTypedCatOverride(catKeys[(i + 1) % catKeys.length]);
  }

  function save() {
    if (!activeAmt) return;
    const label = isType && typedText.trim() ? cleanLabel(typedText) : `${cats[cat].n} — typed`;
    addExpense({ n: label, cat: activeCat, amt: activeAmt });
    navigation.goBack();
  }

  const typedHint = !typedText.trim()
    ? 'Try "lunch w/ sam 18.50" — I\u2019ll pull the amount and guess a category.'
    : typedCatOverride
    ? `Set to ${cats[typedCat].n}. Tap again to change it.`
    : `Guessed ${cats[typedCat].n} from your text \u2014 tap the chip to change it.`;

  return (
    <View style={styles.backdrop}>
      <Pressable style={{ flex: 1 }} onPress={() => navigation.goBack()} />
      <View
        style={[
          styles.sheet,
          {
            paddingBottom: 30 + insets.bottom,
            paddingLeft: 20 + insets.left,
            paddingRight: 20 + insets.right,
            width: "100%",
            maxWidth: isWide ? MAX_CONTENT_WIDTH : undefined,
            alignSelf: "center"
          }
        ]}
      >
        <View style={styles.grabber} />
        <View style={styles.rowBetween}>
          <Text style={styles.title}>Spent on what?</Text>
          <Pressable onPress={() => navigation.goBack()}><Text style={styles.cancel}>Cancel</Text></Pressable>
        </View>

        <View style={styles.segWrap}>
          {[["numpad", "Numpad"], ["type", "Type it"]].map(([k, label]) => {
            const on = mode === k;
            return (
              <Pressable key={k} onPress={() => setMode(k)} style={[styles.segOpt, on && styles.segOptOn]}>
                <Text style={[styles.segLabel, on && styles.segLabelOn]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>

        {mode === "numpad" ? (
          <View>
            <View style={styles.amtRow}>
              <Text style={styles.dollarSign}>$</Text>
              <Text style={[styles.amtDisplay, { color: amtNum > 0 ? colors.ink : colors.inkFainter }]}>{amt || "0"}</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 7, paddingBottom: 16 }}>
              {catKeys.map((k) => {
                const on = cat === k;
                return (
                  <Pressable key={k} onPress={() => setCat(k)} style={[styles.catChip, on && styles.catChipOn]}>
                    <View style={[styles.dotSm, { backgroundColor: cats[k].c }]} />
                    <Text style={styles.catChipLabel}>{cats[k].n}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <View style={styles.keypad}>
              {KEYS.map((k) => (
                <Pressable key={k} onPress={() => press(k)} style={styles.key}>
                  <Text style={styles.keyLabel}>{k}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : (
          <View>
            <View style={styles.typeInputWrap}>
              <TextInput
                value={typedText}
                onChangeText={setTypedText}
                placeholder="lunch w/ sam 18.50"
                placeholderTextColor={colors.inkFainter}
                style={styles.typeInput}
                autoFocus
              />
            </View>
            <View style={styles.chipsRow}>
              <Pressable onPress={cycleTypedCat} style={styles.typedCatChip}>
                <View style={[styles.dotSm, { backgroundColor: cats[typedCat].c }]} />
                <Text style={styles.typedCatChipLabel}>{cats[typedCat].n}</Text>
              </Pressable>
              <View style={styles.staticChip}><Text style={styles.staticChipLabel}>{typedAmt > 0 ? fmt(typedAmt) : "Enter an amount"}</Text></View>
              <View style={styles.staticChip}><Text style={styles.staticChipLabel}>Today</Text></View>
            </View>
            <Text style={styles.hint}>{typedHint}</Text>
          </View>
        )}

        <Pressable
          onPress={save}
          style={[styles.saveBtn, { backgroundColor: activeAmt > 0 ? colors.accent : colors.trackAlt }]}
        >
          <Text style={[styles.saveLabel, { color: activeAmt > 0 ? colors.card : colors.inkFaint }]}>
            {activeAmt > 0 ? `Log ${fmt(activeAmt)} to ${cats[activeCat].n}` : isType ? "Type an amount first" : "Tap a number first"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(32,30,29,0.42)", justifyContent: "flex-end" },
  sheet: { backgroundColor: colors.bg, borderTopLeftRadius: 34, borderTopRightRadius: 34, padding: 20, paddingTop: 14, paddingBottom: 30 },
  grabber: { width: 44, height: 5, borderRadius: radii.pill, backgroundColor: "rgba(32,30,29,0.2)", alignSelf: "center", marginBottom: 16 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  title: { fontFamily: fonts.heading, fontSize: 20, color: colors.ink },
  cancel: { fontFamily: fonts.semibold, fontSize: 13, color: colors.accentDark },
  segWrap: { flexDirection: "row", gap: 4, padding: 4, backgroundColor: colors.track, borderRadius: radii.pill, marginTop: 16 },
  segOpt: { flex: 1, alignItems: "center", paddingVertical: 9, borderRadius: radii.pill },
  segOptOn: { backgroundColor: colors.bg },
  segLabel: { fontFamily: fonts.semibold, fontSize: 12.5, color: colors.inkSoft },
  segLabelOn: { color: colors.ink },
  amtRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "center", gap: 4, paddingVertical: 22 },
  dollarSign: { fontFamily: fonts.heading, fontSize: 26, color: colors.inkFainter, paddingBottom: 6 },
  amtDisplay: { fontFamily: fonts.heading, fontSize: 56 },
  catChip: { flexDirection: "row", alignItems: "center", gap: 7, paddingVertical: 9, paddingHorizontal: 14, borderRadius: radii.pill, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.hairline },
  catChipOn: { backgroundColor: colors.tint, borderColor: colors.accent },
  catChipLabel: { fontFamily: fonts.semibold, fontSize: 12.5, color: colors.ink },
  dotSm: { width: 8, height: 8, borderRadius: radii.pill },
  keypad: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  key: { width: "31.4%", height: 54, borderRadius: 20, backgroundColor: colors.card, alignItems: "center", justifyContent: "center" },
  keyLabel: { fontFamily: fonts.heading, fontSize: 24, color: colors.ink },
  typeInputWrap: { marginTop: 22, marginBottom: 14, borderRadius: radii.md, backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.accent, paddingVertical: 15, paddingHorizontal: 17 },
  typeInput: { fontFamily: fonts.regular, fontSize: 17, color: colors.ink, padding: 0 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  typedCatChip: { flexDirection: "row", alignItems: "center", gap: 7, paddingVertical: 9, paddingHorizontal: 14, borderRadius: radii.pill, backgroundColor: colors.tintWarm },
  typedCatChipLabel: { fontFamily: fonts.semibold, fontSize: 12.5, color: colors.warnText },
  staticChip: { paddingVertical: 9, paddingHorizontal: 14, borderRadius: radii.pill, backgroundColor: colors.tint },
  staticChipLabel: { fontFamily: fonts.semibold, fontSize: 12.5, color: colors.ink },
  hint: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 17, color: colors.inkSoft, marginTop: 12 },
  saveBtn: { marginTop: 14, height: 56, borderRadius: radii.pill, alignItems: "center", justifyContent: "center" },
  saveLabel: { fontFamily: fonts.heading, fontSize: 17 }
});
