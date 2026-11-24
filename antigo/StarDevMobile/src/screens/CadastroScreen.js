import React, { useState } from "react";
import { Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, View, Pressable } from "react-native";
import { colors } from "../theme/colors";
import { fonts, spacing } from "../theme/typography";
import Input from "../components/Input";
import Button from "../components/Button";
import AlertBanner from "../components/AlertBanner";
import { cadastrar } from "../services/authService";
import { validarEmail, validarSenha, validarNome, validarTelefoneDigitos, mensagemRegraSenha } from "../utils/validators";
import { apenasDigitosTelefone, formatarTelefoneBR } from "../utils/mask";

export default function CadastroScreen({ navigation }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [aviso, setAviso] = useState(null);

  function handleTelefoneChange(texto) {
    const digitos = apenasDigitosTelefone(texto);
    setTelefone(digitos);
  }

  async function handleCadastro() {
    setAviso(null);

    if (!validarNome(nome)) {
      setAviso({ texto: "Preencha corretamente o seu nome completo.", tipo: "erro" });
      return;
    }
    if (!validarEmail(email)) {
      setAviso({ texto: "Digite um email válido.", tipo: "erro" });
      return;
    }
    if (!validarTelefoneDigitos(telefone)) {
      setAviso({ texto: "Digite um telefone válido contendo apenas números (DDD + número).", tipo: "erro" });
      return;
    }
    if (!validarSenha(senha)) {
      setAviso({ texto: mensagemRegraSenha(), tipo: "erro" });
      return;
    }
    if (senha !== confirmaSenha) {
      setAviso({ texto: "As senhas não coincidem.", tipo: "erro" });
      return;
    }

    setCarregando(true);
    try {
      const dados = await cadastrar({ nome: nome.trim(), email: email.trim(), senha, telefone });
      const sucesso = /sucesso/i.test(dados.resposta || "");
      setAviso({ texto: dados.resposta || "Não foi possível cadastrar.", tipo: sucesso ? "ok" : "erro" });
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
        <Text style={styles.eyebrow}>$ stardev --cadastro</Text>
        <Text style={styles.titulo}>Crie sua conta grátis</Text>
        <Text style={styles.subtitulo}>Leva menos de um minuto.</Text>

        <AlertBanner texto={aviso?.texto} tipo={aviso?.tipo} />

        <Input label="Nome completo" value={nome} onChangeText={setNome} placeholder="Seu nome completo" />
        <Input label="Email" value={email} onChangeText={setEmail} placeholder="voce@email.com" keyboardType="email-address" autoCapitalize="none" />
        <Input
          label="Telefone"
          value={formatarTelefoneBR(telefone)}
          onChangeText={handleTelefoneChange}
          placeholder="(18) 99999-9999"
          keyboardType="phone-pad"
        />
        <Input label="Senha" value={senha} onChangeText={setSenha} placeholder="Mín. 8 caracteres" secureTextEntry />
        <Input label="Confirmar senha" value={confirmaSenha} onChangeText={setConfirmaSenha} placeholder="Repita a senha" secureTextEntry />

        <Text style={styles.dica}>{mensagemRegraSenha()}</Text>

        <Button title="Criar conta" onPress={handleCadastro} loading={carregando} style={{ marginTop: spacing.sm }} />

        <View style={styles.rodape}>
          <Text style={styles.textoRodape}>Já tem conta?</Text>
          <Pressable onPress={() => navigation.navigate("Login")}>
            <Text style={styles.textoLink}> Entrar</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.primaria },
  conteudo: { padding: spacing.lg, paddingBottom: spacing.xxl },
  eyebrow: { fontFamily: fonts.monoRegular, color: colors.botoes, fontSize: 13, marginBottom: 8 },
  titulo: { fontFamily: fonts.displayBold, fontSize: 26, color: colors.secundaria, marginBottom: 6 },
  subtitulo: { fontFamily: fonts.displayRegular, fontSize: 14, color: colors.letras, marginBottom: spacing.lg },
  dica: { fontFamily: fonts.monoRegular, fontSize: 11, color: colors.reserva, marginBottom: spacing.md, lineHeight: 16 },
  rodape: { flexDirection: "row", justifyContent: "center", marginTop: spacing.lg },
  textoRodape: { fontFamily: fonts.displayRegular, fontSize: 13, color: colors.letras },
  textoLink: { fontFamily: fonts.monoRegular, fontSize: 12.5, color: colors.reserva },
});
