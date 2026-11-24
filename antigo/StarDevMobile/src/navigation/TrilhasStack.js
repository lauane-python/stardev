import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { colors } from "../theme/colors";
import { fonts } from "../theme/typography";
import TrilhasScreen from "../screens/TrilhasScreen";
import MateriaScreen from "../screens/MateriaScreen";

const Stack = createNativeStackNavigator();

export default function TrilhasStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.secundaria },
        headerTintColor: colors.primaria,
        headerTitleStyle: { fontFamily: fonts.displayBold },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="Trilhas" component={TrilhasScreen} options={{ title: "Trilhas" }} />
      <Stack.Screen name="Materia" component={MateriaScreen} options={{ title: "Disciplina" }} />
    </Stack.Navigator>
  );
}
