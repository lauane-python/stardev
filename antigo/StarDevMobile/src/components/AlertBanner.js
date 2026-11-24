import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../theme/colors";
import { fonts } from "../theme/typography";

/** tipo: "ok" | "erro" */
export default function AlertBanner({ texto, tipo = "erro" }) {
  if (!texto) return null;
  const ehOk = tipo === "ok";
  return (
    <View style={[styles.wrap, { backgroundColor: ehOk ? "#e8f0e4" : "#fbeceb", borderColor: ehOk ? colors.sucesso : colors.erro }]}>
      <Text style={[styles.texto, { color: ehOk ? colors.sucesso : colors.erro }]}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  texto: { fontFamily: fonts.displayRegular, fontSize: 13 },
});
