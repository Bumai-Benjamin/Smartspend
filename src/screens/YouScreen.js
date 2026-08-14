import React, { useMemo, useState } from "react";
import { View, Text, TextInput, Image, ScrollView, Pressable, Switch, Share, StyleSheet, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { fonts, radii } from "../theme";
import { useTheme } from "../context/ThemeContext";
import { useSpend, fmt } from "../context/SpendContext";
import { useAuth } from "../context/AuthContext";
import Screen from "../components/Screen";

const THEME_OPTIONS = [
  ["system", "System"],
  ["light", "Light"],
  ["dark", "Dark"]
];

function monthsSince(date) {
  if (!date) return 0;
  const now = new Date();
  return Math.max(0, (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth()));
}

export default function YouScreen({ navigation }) {
  const { colors, theme, setTheme } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { prefs, togglePref, displayName, avatarUrl, updateProfile, uploadAvatar, memberSince, healthInputs, transactions, cats } = useSpend();
  const { user, signOut } = useAuth();

  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(displayName);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  const prefRows = [
    ["nudges", "Gentle nudges", "A poke when a category is nearly empty"],
    ["weekly", "Sunday recap", "One card, 20 seconds, no spreadsheet"],
    ["round", "Round-ups to savings", "Spare change lands in Emergency fund"],
    ["faceid", "Face ID to open", "Because rent is nobody else's business"]
  ];

  const months = monthsSince(memberSince);
  const initial = (displayName || "?").charAt(0).toUpperCase();

  function startEditName() {
    setNameDraft(displayName);
    setEditingName(true);
  }

  function commitName() {
    const next = nameDraft.trim();
    setEditingName(false);
    if (next && next !== displayName) updateProfile({ display_name: next });
  }

  async function pickAvatar() {
    setAvatarError("");
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { setAvatarError("Photo library access is needed to set a profile picture."); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    setAvatarBusy(true);
    try {
      await uploadAvatar(result.assets[0].uri);
    } finally {
      setAvatarBusy(false);
    }
  }

  function exportCsv() {
    const rows = [["Date", "Category", "Label", "Amount"]];
    transactions.forEach((t) => {
      rows.push([t.occurred_at.toISOString().slice(0, 10), cats[t.cat]?.n || t.cat, t.n, t.amt.toFixed(2)]);
    });
    const csv = rows.map((r) => r.map((f) => `"${String(f).replace(/"/g, '""')}"`).join(",")).join("\n");
    Share.share({ message: csv, title: "SmartSpend export" });
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 28 }}>
        <View style={styles.profileRow}>
          <Pressable onPress={pickAvatar} disabled={avatarBusy} style={styles.avatar}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
            ) : (
              <Text style={styles.avatarText}>{initial}</Text>
            )}
            <View style={styles.avatarEditBadge}>
              {avatarBusy ? <ActivityIndicator size="small" color={colors.ink} /> : <Text style={styles.avatarEditBadgeText}>✎</Text>}
            </View>
          </Pressable>
          <View style={{ flex: 1 }}>
            {editingName ? (
              <TextInput
                style={styles.nameInput}
                value={nameDraft}
                onChangeText={setNameDraft}
                onBlur={commitName}
                onSubmitEditing={commitName}
                autoFocus
                maxLength={40}
              />
            ) : (
              <Pressable onPress={startEditName} style={styles.rowCenter}>
                <Text style={styles.name}>{displayName}</Text>
                <Text style={styles.nameEditIcon}>✎</Text>
              </Pressable>
            )}
            <Text style={styles.sub}>
              {user?.email}{months > 0 ? ` · ${months} month${months === 1 ? "" : "s"} on SmartSpend` : ""}
            </Text>
            {!!avatarError && <Text style={styles.avatarErrorText}>{avatarError}</Text>}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.kicker}>Monthly income</Text>
            <Pressable onPress={() => navigation.getParent()?.navigate("Plan", { openHealthInputs: true })}>
              <Text style={styles.editLink}>Edit</Text>
            </Pressable>
          </View>
          <Text style={styles.incomeVal}>{fmt(Number(healthInputs?.income || 0))}</Text>
          <Text style={styles.incomeNote}>Entered manually — SmartSpend doesn't link bank accounts yet.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.kicker}>Appearance</Text>
          <View style={styles.segWrap}>
            {THEME_OPTIONS.map(([k, label]) => {
              const on = theme === k;
              return (
                <Pressable key={k} onPress={() => setTheme(k)} style={[styles.segOpt, on && styles.segOptOn]}>
                  <Text style={[styles.segLabel, on && styles.segLabelOn]}>{label}</Text>
                </Pressable>
              );
            })}
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
                thumbColor={colors.onAccent}
              />
            </View>
          ))}
          <Text style={styles.prefFooterNote}>Some of these are still being built — your choice is saved and we'll start honoring it as each one ships.</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>SmartSpend 1.0 · your data is stored securely and only visible to you.</Text>
          <Pressable onPress={exportCsv}><Text style={styles.exportLink}>Export all as CSV</Text></Pressable>
          <Pressable onPress={signOut}><Text style={styles.signOutLink}>Sign out</Text></Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    profileRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 20, paddingTop: 8 },
    avatar: { width: 62, height: 62, borderRadius: radii.pill, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center", overflow: "visible" },
    avatarImg: { width: 62, height: 62, borderRadius: radii.pill },
    avatarText: { fontFamily: fonts.heading, fontSize: 24, color: colors.onAccent },
    avatarEditBadge: { position: "absolute", right: -2, bottom: -2, width: 22, height: 22, borderRadius: radii.pill, backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.bg, alignItems: "center", justifyContent: "center" },
    avatarEditBadgeText: { fontSize: 11, color: colors.ink },
    avatarErrorText: { fontFamily: fonts.regular, fontSize: 11.5, color: colors.danger, marginTop: 4 },
    rowCenter: { flexDirection: "row", alignItems: "center", gap: 7 },
    name: { fontFamily: fonts.heading, fontSize: 24, color: colors.ink },
    nameEditIcon: { fontSize: 12, color: colors.inkFainter },
    nameInput: { fontFamily: fonts.heading, fontSize: 24, color: colors.ink, backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.accent, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
    sub: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.inkSoft, marginTop: 3 },
    card: { marginHorizontal: 20, marginTop: 20, backgroundColor: colors.card, borderRadius: radii.md, padding: 18 },
    kicker: { fontFamily: fonts.regular, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: colors.inkFaint },
    rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    editLink: { fontFamily: fonts.semibold, fontSize: 12, color: colors.accentDark },
    incomeVal: { fontFamily: fonts.heading, fontSize: 28, color: colors.ink, marginTop: 8 },
    incomeNote: { fontFamily: fonts.regular, fontSize: 11.5, color: colors.inkFaint, marginTop: 6 },
    dotSm: { width: 8, height: 8, borderRadius: radii.pill },
    segWrap: { flexDirection: "row", gap: 4, padding: 4, backgroundColor: colors.track, borderRadius: radii.pill, marginTop: 12 },
    segOpt: { flex: 1, alignItems: "center", paddingVertical: 9, borderRadius: radii.pill },
    segOptOn: { backgroundColor: colors.bg },
    segLabel: { fontFamily: fonts.semibold, fontSize: 12.5, color: colors.inkSoft },
    segLabelOn: { color: colors.ink },
    sourceName: { fontFamily: fonts.semibold, fontSize: 13.5, color: colors.ink },
    prefRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 15, paddingHorizontal: 18 },
    prefDivider: { borderTopWidth: 1, borderTopColor: colors.hairline },
    prefFooterNote: { fontFamily: fonts.regular, fontSize: 11, color: colors.inkFaint, lineHeight: 15, padding: 18, paddingTop: 4 },
    txMeta: { fontFamily: fonts.regular, fontSize: 11.5, color: colors.inkFaint, marginTop: 2 },
    footer: { paddingHorizontal: 20, paddingTop: 24, gap: 9 },
    footerText: { fontFamily: fonts.regular, fontSize: 12, color: colors.inkFaint },
    exportLink: { fontFamily: fonts.semibold, fontSize: 13, color: colors.accentDark },
    signOutLink: { fontFamily: fonts.semibold, fontSize: 13, color: colors.danger }
  });
}
