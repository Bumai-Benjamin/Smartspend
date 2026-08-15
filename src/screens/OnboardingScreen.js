import React, { useMemo, useState } from "react";
import { View, Text, TextInput, Image, Pressable, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { fonts, radii } from "../theme";
import { useTheme } from "../context/ThemeContext";
import { useSpend } from "../context/SpendContext";
import { useAuth } from "../context/AuthContext";
import Screen from "../components/Screen";

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { avatarUrl, updateProfile, uploadAvatar } = useSpend();
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [busy, setBusy] = useState(false);

  const initial = (user?.email || "?").charAt(0).toUpperCase();

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

  function finish(withName) {
    setBusy(true);
    const patch = { onboarded: true };
    if (withName) {
      const trimmed = name.trim();
      if (trimmed) patch.display_name = trimmed;
    }
    updateProfile(patch);
  }

  return (
    <Screen edges={["top", "bottom", "left", "right"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <View style={styles.wrap}>
          <Text style={styles.logo}>SmartSpend</Text>
          <Text style={styles.title}>Welcome to SmartSpend</Text>
          <Text style={styles.sub}>Add a name and a photo — or skip and do it later from the You tab.</Text>

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
          {!!avatarError && <Text style={styles.avatarErrorText}>{avatarError}</Text>}

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Your name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="What should we call you?"
              placeholderTextColor={colors.inkFainter}
              style={styles.input}
              maxLength={40}
            />
          </View>

          <Pressable onPress={() => finish(true)} disabled={busy} style={[styles.submitBtn, busy && { opacity: 0.6 }]}>
            {busy ? <ActivityIndicator color={colors.onAccent} /> : <Text style={styles.submitLabel}>Continue</Text>}
          </Pressable>
          <Pressable onPress={() => finish(false)} disabled={busy}>
            <Text style={styles.skipLabel}>Skip for now</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    wrap: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 },
    logo: { fontFamily: fonts.heading, fontSize: 22, color: colors.ink },
    title: { fontFamily: fonts.heading, fontSize: 24, color: colors.ink, textAlign: "center", marginTop: 18 },
    sub: { fontFamily: fonts.regular, fontSize: 13, color: colors.inkSoft, textAlign: "center", marginTop: 8, marginBottom: 26 },
    avatar: { width: 84, height: 84, borderRadius: radii.pill, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center", overflow: "visible" },
    avatarImg: { width: 84, height: 84, borderRadius: radii.pill },
    avatarText: { fontFamily: fonts.heading, fontSize: 30, color: colors.onAccent },
    avatarEditBadge: { position: "absolute", right: -2, bottom: -2, width: 26, height: 26, borderRadius: radii.pill, backgroundColor: colors.card, borderWidth: 2, borderColor: colors.bg, alignItems: "center", justifyContent: "center" },
    avatarEditBadgeText: { fontSize: 12, color: colors.ink },
    avatarErrorText: { fontFamily: fonts.regular, fontSize: 12, color: colors.danger, marginTop: 10, textAlign: "center" },
    field: { width: "100%", marginTop: 26, marginBottom: 20 },
    fieldLabel: { fontFamily: fonts.semibold, fontSize: 12, color: colors.inkFaint, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 },
    input: {
      backgroundColor: colors.card,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.hairline,
      paddingVertical: 14,
      paddingHorizontal: 16,
      fontFamily: fonts.regular,
      fontSize: 15,
      color: colors.ink
    },
    submitBtn: { width: "100%", height: 54, borderRadius: radii.pill, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" },
    submitLabel: { fontFamily: fonts.heading, fontSize: 16, color: colors.onAccent },
    skipLabel: { fontFamily: fonts.semibold, fontSize: 13, color: colors.inkFaint, marginTop: 16 }
  });
}
