import React, { useCallback } from "react";
import { View } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { useFonts as useCaprasimo, Caprasimo_400Regular } from "@expo-google-fonts/caprasimo";
import { useFonts as useFigtree, Figtree_400Regular, Figtree_600SemiBold, Figtree_700Bold } from "@expo-google-fonts/figtree";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./src/context/AuthContext";
import { SpendProvider } from "./src/context/SpendContext";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import RootNavigator from "./src/navigation/RootNavigator";

SplashScreen.preventAutoHideAsync().catch(() => {});

function AppShell({ onLayout }) {
  const { colors, resolvedScheme } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }} onLayout={onLayout}>
      <StatusBar style={resolvedScheme === "dark" ? "light" : "dark"} />
      <RootNavigator />
    </View>
  );
}

export default function App() {
  const [capLoaded] = useCaprasimo({ Caprasimo_400Regular });
  const [figLoaded] = useFigtree({ Figtree_400Regular, Figtree_600SemiBold, Figtree_700Bold });
  const ready = capLoaded && figLoaded;

  const onLayout = useCallback(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <SpendProvider>
            <AppShell onLayout={onLayout} />
          </SpendProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
