import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { colors } from "../theme/colors";
import { fonts } from "../theme/typography";
import WelcomeScreen from "../screens/WelcomeScreen";
import LoginScreen from "../screens/LoginScreen";
import CadastroScreen from "../screens/CadastroScreen";
import EsqueciSenhaScreen from "../screens/EsqueciSenhaScreen";

const Stack = createNativeStackNavigator();

const opcoesCabecalho = {
  headerStyle: { backgroundColor: colors.secundaria },
  headerTintColor: colors.primaria,
  headerTitleStyle: { fontFamily: fonts.displayBold },
  headerShadowVisible: false,
};

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={opcoesCabecalho}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ title: "StarDev" }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Entrar" }} />
      <Stack.Screen name="Cadastro" component={CadastroScreen} options={{ title: "Criar conta" }} />
      <Stack.Screen name="EsqueciSenha" component={EsqueciSenhaScreen} options={{ title: "Recuperar senha" }} />
    </Stack.Navigator>
  );
}
