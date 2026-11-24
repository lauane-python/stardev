import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { fonts } from "../theme/typography";

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  erro,
  secureTextEntry,
  keyboardType,
  autoCapitalize = "sentences",
  multiline = false,
  maxLength,
}) {
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const ehSenha = !!secureTextEntry;

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.campoWrap, erro ? styles.campoErro : null, multiline && styles.multilineWrap]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#8a7a72"
          secureTextEntry={ehSenha && !mostrarSenha}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          maxLength={maxLength}
          style={[styles.campo, multiline && styles.multiline]}
        />
        {ehSenha && (
          <Pressable onPress={() => setMostrarSenha((v) => !v)} hitSlop={10}>
            <Ionicons name={mostrarSenha ? "eye-off" : "eye"} size={20} color={colors.secundaria} />
          </Pressable>
        )}
      </View>
      {erro ? <Text style={styles.textoErro}>{erro}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: {
    fontFamily: fonts.monoRegular,
    fontSize: 12,
    color: colors.secundaria,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  campoWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.branco,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.terciaria,
    paddingHorizontal: 14,
  },
  multilineWrap: { alignItems: "flex-start", paddingVertical: 8 },
  campoErro: { borderColor: colors.erro },
  campo: {
    flex: 1,
    paddingVertical: 12,
    fontFamily: fonts.displayRegular,
    fontSize: 15,
    color: colors.letras,
  },
  multiline: { minHeight: 90, textAlignVertical: "top" },
  textoErro: {
    marginTop: 6,
    fontFamily: fonts.monoRegular,
    fontSize: 12,
    color: colors.erro,
  },
});
