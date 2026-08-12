import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { colors } from "../theme";

import HomeScreen from "../screens/HomeScreen";
import ActivityScreen from "../screens/ActivityScreen";
import InsightsScreen from "../screens/InsightsScreen";
import PlanScreen from "../screens/PlanScreen";
import YouScreen from "../screens/YouScreen";
import CategoryDetailScreen from "../screens/CategoryDetailScreen";
import AddExpenseScreen from "../screens/AddExpenseScreen";

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
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: "rgba(32,30,29,0.45)",
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.hairline, height: 78, paddingTop: 6, paddingBottom: 22 },
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
  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Tabs" component={Tabs} />
        <RootStack.Screen name="CategoryDetail" component={CategoryDetailScreen} />
        <RootStack.Group screenOptions={{ presentation: "transparentModal", animation: "fade" }}>
          <RootStack.Screen name="AddExpense" component={AddExpenseScreen} />
        </RootStack.Group>
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
