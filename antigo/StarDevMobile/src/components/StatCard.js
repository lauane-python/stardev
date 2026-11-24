import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../theme/colors";
import { fonts } from "../theme/typography";

export default function StatCard({ valor, rotulo }) {
  return (
    <View style={styles.card}>
      <Text style={styles.valor}>{valor}</Text>
      <Text style={styles.rotulo}>{rotulo}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.secundaria,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: "center",
    marginHorizontal: 4,
  },
  valor: {
    fontFamily: fonts.displayBold,
    fontSize: 26,
    color: colors.destaque,
  },
  rotulo: {
    fontFamily: fonts.monoRegular,
    fontSize: 10,
    color: colors.primaria,
    textAlign: "center",
    marginTop: 4,
  },
});
