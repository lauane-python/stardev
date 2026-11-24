import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { fonts } from "../theme/typography";
import { useAuth } from "../context/AuthContext";
import TrilhasStack from "./TrilhasStack";
import PerfilScreen from "../screens/PerfilScreen";
import AdminScreen from "../screens/AdminScreen";

const Tab = createBottomTabNavigator();

const ICONES = {
  TrilhasTab: "book-outline",
  Perfil: "person-outline",
  Admin: "shield-checkmark-outline",
};

export default function AppTabs() {
  const { isAdmin } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.botoes,
        tabBarInactiveTintColor: colors.reserva,
        tabBarStyle: { backgroundColor: colors.branco, borderTopColor: colors.terciaria },
        tabBarLabelStyle: { fontFamily: fonts.monoRegular, fontSize: 11 },
        tabBarIcon: ({ color, size }) => <Ionicons name={ICONES[route.name]} size={size} color={color} />,
      })}
    >
      <Tab.Screen name="TrilhasTab" component={TrilhasStack} options={{ title: "Trilhas" }} />
      <Tab.Screen name="Perfil" component={PerfilScreen} options={{ title: "Perfil" }} />
      {isAdmin && <Tab.Screen name="Admin" component={AdminScreen} options={{ title: "Admin" }} />}
    </Tab.Navigator>
  );
}
