import React, { useState } from "react";
import { Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { colors } from "../theme/colors";
import { fonts, spacing } from "../theme/typography";
import Input from "../components/Input";
import Button from "../components/Button";
import AlertBanner from "../components/AlertBanner";
import { verificarEmailExiste, recuperarSenha } from "../services/authService";
import { validarEmail } from "../utils/validators";

export default function EsqueciSenhaScreen({ navigation }) {
  const [etapa, setEtapa] = useState(1); 
  const [email, setEmail] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [aviso, setAviso] = useState(null);

  async function handleVerificarEmail() {
    setAviso(null);
    if (!validarEmail(email)) {
      setAviso({ texto: "Digite um email válido.", tipo: "erro" });
      return;
    }
    setCarregando(true);
    try {
      const existe = await verificarEmailExiste(email.trim());
      if (!existe) {
        setAviso({ texto: "Não encontramos esse email cadastrado.", tipo: "erro" });
        return;
      }
      setEtapa(2);
    } catch {
      setAviso({ texto: "Não foi possível falar com o servidor da StarDev.", tipo: "erro" });
    } finally {
      setCarregando(false);
    }
  }

  async function handleRedefinir() {
    setAviso(null);
    if (novaSenha.trim().length < 6) {
      setAviso({ texto: "A nova senha deve ter pelo menos 6 caracteres.", tipo: "erro" });
      return;
    }
    if (novaSenha !== confirmaSenha) {
      setAviso({ texto: "As senhas não coincidem.", tipo: "erro" });
      return;
    }
    setCarregando(true);
    try {
      const dados = await recuperarSenha({ email: email.trim(), novaSenha });
      const sucesso = /sucesso/i.test(dados.resposta || "");
      setAviso({ texto: dados.resposta || "Não foi possível redefinir a senha.", tipo: sucesso ? "ok" : "erro" });
      if (sucesso) {
        setTimeout(() => navigation.navigate("Login"), 900);
      }
    } catch {
      setAviso({ texto: "Não foi possível falar com o servidor da StarDev.", tipo: "erro" });
    } finally {
      setCarregando(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.tela} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
        <Text style={styles.eyebrow}>$ stardev --recuperar</Text>
        <Text style={styles.titulo}>Esqueci minha senha</Text>
        <Text style={styles.subtitulo}>
          {etapa === 1 ? "Digite o email usado no cadastro." : "Defina sua nova senha."}
        </Text>

        <AlertBanner texto={aviso?.texto} tipo={aviso?.tipo} />

        {etapa === 1 ? (
          <>
            <Input label="Email" value={email} onChangeText={setEmail} placeholder="voce@email.com" keyboardType="email-address" autoCapitalize="none" />
            <Button title="Continuar" onPress={handleVerificarEmail} loading={carregando} />
          </>
        ) : (
          <>
            <Input label="Nova senha" value={novaSenha} onChangeText={setNovaSenha} placeholder="Nova senha" secureTextEntry />
            <Input label="Confirmar nova senha" value={confirmaSenha} onChangeText={setConfirmaSenha} placeholder="Repita a nova senha" secureTextEntry />
            <Button title="Redefinir senha" onPress={handleRedefinir} loading={carregando} />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.primaria },
  conteudo: { padding: spacing.lg, flexGrow: 1, justifyContent: "center" },
  eyebrow: { fontFamily: fonts.monoRegular, color: colors.botoes, fontSize: 13, marginBottom: 8 },
  titulo: { fontFamily: fonts.displayBold, fontSize: 26, color: colors.secundaria, marginBottom: 6 },
  subtitulo: { fontFamily: fonts.displayRegular, fontSize: 14, color: colors.letras, marginBottom: spacing.lg },
});
