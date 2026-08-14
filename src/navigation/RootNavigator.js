import React from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useSpend } from "../context/SpendContext";

import HomeScreen from "../screens/HomeScreen";
import ActivityScreen from "../screens/ActivityScreen";
import InsightsScreen from "../screens/InsightsScreen";
import PlanScreen from "../screens/PlanScreen";
import YouScreen from "../screens/YouScreen";
import CategoryDetailScreen from "../screens/CategoryDetailScreen";
import AddExpenseScreen from "../screens/AddExpenseScreen";
import AuthScreen from "../screens/auth/AuthScreen";

const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();

const ICONS = {
  Home: "home",
  Activity: "list",
  Insights: "trending-up",
  Plan: "credit-card",
  You: "user"
};

function Tabs() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarBottomPad = Math.max(insets.bottom, 12);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.inkFaint,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.hairline,
          height: 56 + tabBarBottomPad,
          paddingTop: 6,
          paddingBottom: tabBarBottomPad,
          paddingLeft: insets.left,
          paddingRight: insets.right
        },
        tabBarLabelStyle: { fontSize: 10, fontFamily: "Figtree_600SemiBold" },
        tabBarIcon: ({ color, size }) => <Feather name={ICONS[route.name]} size={size ? size - 1 : 22} color={color} />
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Activity" component={ActivityScreen} />
      <Tab.Screen name="Insights" component={InsightsScreen} />
      <Tab.Screen name="Plan" component={PlanScreen} />
      <Tab.Screen name="You" component={YouScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { colors } = useTheme();
  const { session, loading: authLoading } = useAuth();
  const { loading: spendLoading } = useSpend();
  const loading = authLoading || (!!session && spendLoading);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!session ? (
          <RootStack.Screen name="Auth" component={AuthScreen} />
        ) : (
          <>
            <RootStack.Screen name="Tabs" component={Tabs} />
            <RootStack.Screen name="CategoryDetail" component={CategoryDetailScreen} />
            <RootStack.Group screenOptions={{ presentation: "transparentModal", animation: "fade" }}>
              <RootStack.Screen name="AddExpense" component={AddExpenseScreen} />
            </RootStack.Group>
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
