import React from "react";
import { Pressable, Text, StyleSheet, ActivityIndicator } from "react-native";
import { colors } from "../theme/colors";
import { fonts } from "../theme/typography";

/**
 * variant: "primario" (botão-oliva) | "secundario" (contorno vinho) | "destaque" (amarelo)
 */
export default function Button({ title, onPress, variant = "primario", loading = false, disabled = false, style }) {
  const isSecundario = variant === "secundario";
  const isDestaque = variant === "destaque";

  const bgColor = isSecundario ? "transparent" : isDestaque ? colors.destaque : colors.botoes;
  const textColor = isSecundario ? colors.secundaria : isDestaque ? colors.letras : colors.branco;
  const borderColor = isSecundario ? colors.secundaria : "transparent";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: bgColor, borderColor, opacity: disabled ? 0.6 : pressed ? 0.85 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.texto, { color: textColor }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  texto: {
    fontFamily: fonts.displayMedium,
    fontSize: 16,
  },
});
