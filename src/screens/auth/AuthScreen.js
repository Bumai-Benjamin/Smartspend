import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { colors, fonts, radii } from "../../theme";
import { useAuth } from "../../context/AuthContext";
import Screen from "../../components/Screen";

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function submit() {
    setError("");
    setNotice("");
    if (!email.trim() || !password) {
      setError("Enter an email and password.");
      return;
    }
    if (mode === "signup" && password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signin") {
        await signIn(email.trim(), password);
      } else {
        await signUp(email.trim(), password);
        setNotice("Check your email to confirm your account, then sign in.");
        setMode("signin");
      }
    } catch (e) {
      setError(e.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen edges={["top", "bottom", "left", "right"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <View style={styles.wrap}>
          <Text style={styles.logo}>SmartSpend</Text>
          <Text style={styles.tag}>{mode === "signin" ? "Welcome back." : "Let's set up your budget."}</Text>

          <View style={styles.segWrap}>
            {[["signin", "Sign in"], ["signup", "Sign up"]].map(([k, label]) => {
              const on = mode === k;
              return (
                <Pressable
                  key={k}
                  onPress={() => { setMode(k); setError(""); setNotice(""); }}
                  style={[styles.segOpt, on && styles.segOptOn]}
                >
                  <Text style={[styles.segLabel, on && styles.segLabelOn]}>{label}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              placeholder="you@example.com"
              placeholderTextColor={colors.inkFainter}
              style={styles.input}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
              placeholder="••••••••"
              placeholderTextColor={colors.inkFainter}
              style={styles.input}
            />
          </View>

          {!!error && <Text style={styles.error}>{error}</Text>}
          {!!notice && <Text style={styles.notice}>{notice}</Text>}

          <Pressable onPress={submit} disabled={busy} style={[styles.submitBtn, busy && { opacity: 0.6 }]}>
            {busy ? (
              <ActivityIndicator color={colors.card} />
            ) : (
              <Text style={styles.submitLabel}>{mode === "signin" ? "Sign in" : "Create account"}</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: "center", paddingHorizontal: 24 },
  logo: { fontFamily: fonts.heading, fontSize: 34, color: colors.ink, textAlign: "center" },
  tag: { fontFamily: fonts.regular, fontSize: 14, color: colors.inkSoft, textAlign: "center", marginTop: 8, marginBottom: 28 },
  segWrap: { flexDirection: "row", gap: 4, padding: 4, backgroundColor: colors.track, borderRadius: radii.pill, marginBottom: 24 },
  segOpt: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: radii.pill },
  segOptOn: { backgroundColor: colors.card },
  segLabel: { fontFamily: fonts.semibold, fontSize: 13, color: colors.inkSoft },
  segLabelOn: { color: colors.ink },
  field: { marginBottom: 16 },
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
  error: { fontFamily: fonts.regular, fontSize: 13, color: colors.danger, marginBottom: 12 },
  notice: { fontFamily: fonts.regular, fontSize: 13, color: colors.sage, marginBottom: 12 },
  submitBtn: { height: 54, borderRadius: radii.pill, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center", marginTop: 4 },
  submitLabel: { fontFamily: fonts.heading, fontSize: 16, color: colors.card }
});
