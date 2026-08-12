import React, { useCallback } from "react";
import { View } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { useFonts as useCaprasimo, Caprasimo_400Regular } from "@expo-google-fonts/caprasimo";
import { useFonts as useFigtree, Figtree_400Regular, Figtree_600SemiBold, Figtree_700Bold } from "@expo-google-fonts/figtree";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SpendProvider } from "./src/context/SpendContext";
import RootNavigator from "./src/navigation/RootNavigator";
import { colors } from "./src/theme";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [capLoaded] = useCaprasimo({ Caprasimo_400Regular });
  const [figLoaded] = useFigtree({ Figtree_400Regular, Figtree_600SemiBold, Figtree_700Bold });
  const ready = capLoaded && figLoaded;

  const onLayout = useCallback(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }} onLayout={onLayout}>
      <SafeAreaProvider>
        <SpendProvider>
          <StatusBar style="dark" />
          <RootNavigator />
        </SpendProvider>
      </SafeAreaProvider>
    </View>
  );
}
