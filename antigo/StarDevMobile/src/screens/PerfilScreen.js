import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Image, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { colors } from "../theme/colors";
import { fonts, spacing } from "../theme/typography";
import Input from "../components/Input";
import Button from "../components/Button";
import AlertBanner from "../components/AlertBanner";
import { useAuth } from "../context/AuthContext";
import { atualizarUsuario, trocarSenha, enviarFotoPerfil } from "../services/authService";
import { apiUrl } from "../config/api";
import { apenasDigitosTelefone, formatarTelefoneBR, iniciaisNome } from "../utils/mask";

export default function PerfilScreen() {
  const { token, nivel, usuario, carregarUsuario, atualizarPerfilLocal, sair } = useAuth();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [bio, setBio] = useState("");
  const [fotoUri, setFotoUri] = useState(null);

  const [novaSenha, setNovaSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");

  const [salvandoPerfil, setSalvandoPerfil] = useState(false);
  const [salvandoSenha, setSalvandoSenha] = useState(false);
  const [avisoPerfil, setAvisoPerfil] = useState(null);
  const [avisoSenha, setAvisoSenha] = useState(null);

  useEffect(() => {
    (async () => {
      const dados = await carregarUsuario();
      if (dados) {
        setNome(dados.nome || "");
        setEmail(dados.email || "");
        setTelefone(dados.telefone || "");
        setBio(dados.bio || "");
        if (dados.foto) setFotoUri(apiUrl(dados.foto));
      }
    })();
  }, []);

  async function handleSalvarPerfil() {
    setAvisoPerfil(null);
    setSalvandoPerfil(true);
    try {
      const dados = await atualizarUsuario(token, {
        nome: nome.trim(),
        email: email.trim(),
        telefone: apenasDigitosTelefone(telefone),
        bio: bio.trim(),
      });
      const sucesso = /sucesso/i.test(dados.resposta || "");
      setAvisoPerfil({ texto: dados.resposta || "Não foi possível salvar.", tipo: sucesso ? "ok" : "erro" });
      if (sucesso) atualizarPerfilLocal({ nome, email, telefone, bio });
    } catch {
      setAvisoPerfil({ texto: "Não foi possível falar com o servidor da StarDev.", tipo: "erro" });
    } finally {
      setSalvandoPerfil(false);
    }
  }

  async function handleTrocarFoto() {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert("Permissão necessária", "Precisamos acessar sua galeria para trocar a foto.");
      return;
    }
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (resultado.canceled) return;

    const arquivo = resultado.assets[0];
    setFotoUri(arquivo.uri);
    try {
      const dados = await enviarFotoPerfil(token, arquivo);
      if (!dados.foto) {
        Alert.alert("Ops", dados.resposta || "Não foi possível atualizar a foto.");
      }
    } catch {
      Alert.alert("Ops", "Não foi possível enviar a foto agora.");
    }
  }

  async function handleTrocarSenha() {
    setAvisoSenha(null);
    if (novaSenha !== confirmaSenha) {
      setAvisoSenha({ texto: "As senhas não coincidem.", tipo: "erro" });
      return;
    }
    setSalvandoSenha(true);
    try {
      const dados = await trocarSenha(token, novaSenha);
      const sucesso = /sucesso/i.test(dados.resposta || "");
      setAvisoSenha({ texto: dados.resposta || "Não foi possível atualizar a senha.", tipo: sucesso ? "ok" : "erro" });
      if (sucesso) {
        setNovaSenha("");
        setConfirmaSenha("");
      }
    } catch {
      setAvisoSenha({ texto: "Não foi possível falar com o servidor da StarDev.", tipo: "erro" });
    } finally {
      setSalvandoSenha(false);
    }
  }

  return (
    <ScrollView style={styles.tela} contentContainerStyle={styles.conteudo}>
      <View style={styles.cabecalhoAvatar}>
        <Pressable onPress={handleTrocarFoto}>
          {fotoUri ? (
            <Image source={{ uri: fotoUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarIniciais}>{iniciaisNome(nome)}</Text>
            </View>
          )}
          <View style={styles.badgeEditar}>
            <Text style={styles.textoBadge}>editar</Text>
          </View>
        </Pressable>
        <Text style={styles.nomeUsuario}>{nome || "Aluno(a)"}</Text>
        <Text style={styles.nivelUsuario}>{nivel === "A" ? "administrador" : "estudante"}</Text>
      </View>

      <Text style={styles.tituloSecao}>Meus dados</Text>
      <AlertBanner texto={avisoPerfil?.texto} tipo={avisoPerfil?.tipo} />
      <Input label="Nome" value={nome} onChangeText={setNome} />
      <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <Input label="Telefone" value={formatarTelefoneBR(telefone)} onChangeText={(t) => setTelefone(apenasDigitosTelefone(t))} keyboardType="phone-pad" />
      <Input label="Bio" value={bio} onChangeText={setBio} multiline placeholder="Fale um pouco sobre você" />
      <Button title="Salvar alterações" onPress={handleSalvarPerfil} loading={salvandoPerfil} />

      <Text style={[styles.tituloSecao, { marginTop: spacing.xl }]}>Alterar senha</Text>
      <AlertBanner texto={avisoSenha?.texto} tipo={avisoSenha?.tipo} />
      <Input label="Nova senha" value={novaSenha} onChangeText={setNovaSenha} secureTextEntry />
      <Input label="Confirmar nova senha" value={confirmaSenha} onChangeText={setConfirmaSenha} secureTextEntry />
      <Button title="Atualizar senha" variant="secundario" onPress={handleTrocarSenha} loading={salvandoSenha} />

      <Button title="Sair da conta" variant="destaque" onPress={sair} style={{ marginTop: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.primaria },
  conteudo: { padding: spacing.lg, paddingBottom: spacing.xxl },
  cabecalhoAvatar: { alignItems: "center", marginBottom: spacing.lg },
  avatar: { width: 92, height: 92, borderRadius: 46, borderWidth: 3, borderColor: colors.destaque },
  avatarPlaceholder: { backgroundColor: colors.destaque, alignItems: "center", justifyContent: "center" },
  avatarIniciais: { fontFamily: fonts.displayBold, fontSize: 28, color: colors.letras },
  badgeEditar: {
    position: "absolute",
    bottom: -4,
    alignSelf: "center",
    backgroundColor: colors.secundaria,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    left: "18%",
  },
  textoBadge: { fontFamily: fonts.monoRegular, fontSize: 10, color: colors.primaria },
  nomeUsuario: { fontFamily: fonts.displayBold, fontSize: 18, color: colors.secundaria, marginTop: 14 },
  nivelUsuario: { fontFamily: fonts.monoRegular, fontSize: 11, color: colors.reserva, textTransform: "uppercase" },
  tituloSecao: { fontFamily: fonts.displayBold, fontSize: 16, color: colors.secundaria, marginBottom: spacing.sm },
});
