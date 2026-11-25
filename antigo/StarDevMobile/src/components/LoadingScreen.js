import React from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { colors } from "../theme/colors";

export default function LoadingScreen({ texto = "Carregando..." }) {
  return (
    <View style={styles.wrap}>
      <ActivityIndicator size="large" color={colors.botoes} />
      <Text style={styles.texto}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.primaria, gap: 12 },
  texto: { color: colors.secundaria },
});
