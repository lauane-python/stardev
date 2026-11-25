import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import LoadingScreen from "../components/LoadingScreen";
import AuthStack from "./AuthStack";
import AppTabs from "./AppTabs";

export default function RootNavigator() {
  const { logado, carregandoSessao } = useAuth();

  if (carregandoSessao) return <LoadingScreen texto="Preparando o StarDev..." />;

  return <NavigationContainer>{logado ? <AppTabs /> : <AuthStack />}</NavigationContainer>;
}
