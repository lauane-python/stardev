import React, { useState } from "react";
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Image, Pressable } from "react-native";
import { colors } from "../theme/colors";
import { fonts, spacing } from "../theme/typography";
import Input from "../components/Input";
import Button from "../components/Button";
import AlertBanner from "../components/AlertBanner";
import { useAuth } from "../context/AuthContext";
import { validarEmail } from "../utils/validators";

export default function LoginScreen({ navigation }) {
  const { entrar } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [aviso, setAviso] = useState(null);

  async function handleLogin() {
    setAviso(null);

    if (!validarEmail(email)) {
      setAviso({ texto: "Digite um email válido.", tipo: "erro" });
      return;
    }
    if (!senha) {
      setAviso({ texto: "Preencha a senha.", tipo: "erro" });
      return;
    }

    setCarregando(true);
    try {
      const dados = await entrar(email.trim(), senha);
      if (!dados.token) {
        setAviso({ texto: dados.resposta || "Não foi possível entrar.", tipo: "erro" });
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
        <Text style={styles.eyebrow}>$ stardev --login</Text>
        <Text style={styles.titulo}>Bem-vindo(a) de volta</Text>
        <Text style={styles.subtitulo}>Entre com o email e senha do seu cadastro.</Text>

        <AlertBanner texto={aviso?.texto} tipo={aviso?.tipo} />

        <Input label="Email" value={email} onChangeText={setEmail} placeholder="voce@email.com" keyboardType="email-address" autoCapitalize="none" />
        <Input label="Senha" value={senha} onChangeText={setSenha} placeholder="Sua senha" secureTextEntry />

        <Pressable onPress={() => navigation.navigate("EsqueciSenha")} style={styles.linkEsqueci}>
          <Text style={styles.textoLink}>Esqueci minha senha</Text>
        </Pressable>

        <Button title="Entrar" onPress={handleLogin} loading={carregando} style={{ marginTop: spacing.sm }} />

        <View style={styles.rodape}>
          <Text style={styles.textoRodape}>Ainda não tem conta?</Text>
          <Pressable onPress={() => navigation.navigate("Cadastro")}>
            <Text style={styles.textoLink}> Cadastre-se</Text>
          </Pressable>
        </View>
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
  linkEsqueci: { alignSelf: "flex-end", marginBottom: spacing.md, marginTop: -6 },
  textoLink: { fontFamily: fonts.monoRegular, fontSize: 12.5, color: colors.reserva },
  rodape: { flexDirection: "row", justifyContent: "center", marginTop: spacing.lg },
  textoRodape: { fontFamily: fonts.displayRegular, fontSize: 13, color: colors.letras },
});
