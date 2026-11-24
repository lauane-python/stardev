import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { fonts } from "../theme/typography";

export default function EmptyState({ icone = "information-circle-outline", texto }) {
  return (
    <View style={styles.wrap}>
      <Ionicons name={icone} size={30} color={colors.reserva} />
      <Text style={styles.texto}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center", paddingVertical: 32, gap: 8 },
  texto: {
    fontFamily: fonts.displayRegular,
    fontSize: 14,
    color: colors.secundaria,
    textAlign: "center",
    paddingHorizontal: 24,
  },
});
