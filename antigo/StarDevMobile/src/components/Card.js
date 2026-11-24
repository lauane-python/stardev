import React from "react";
import { View, StyleSheet } from "react-native";
import { colors } from "../theme/colors";

export default function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.branco,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.terciaria,
    shadowColor: colors.secundaria,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
});
