import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, FlatList, Pressable, Alert } from "react-native";
import { colors } from "../theme/colors";
import { fonts, spacing } from "../theme/typography";
import Input from "../components/Input";
import Button from "../components/Button";
import Card from "../components/Card";
import AlertBanner from "../components/AlertBanner";
import EmptyState from "../components/EmptyState";
import LoadingScreen from "../components/LoadingScreen";
import { useAuth } from "../context/AuthContext";
import { listarFeedbacks, excluirFeedback, cadastrarDisciplina, cadastrarVideoaula } from "../services/adminService";
import { listarDisciplinas } from "../services/conteudoService";

export default function AdminScreen() {
  const { token } = useAuth();

  const [feedbacks, setFeedbacks] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const [materia, setMateria] = useState("");
  const [duracao, setDuracao] = useState("");
  const [qtdAulas, setQtdAulas] = useState("");
  const [avisoDisciplina, setAvisoDisciplina] = useState(null);
  const [salvandoDisciplina, setSalvandoDisciplina] = useState(false);

  const [idAulaSelecionada, setIdAulaSelecionada] = useState(null);
  const [nomeAula, setNomeAula] = useState("");
  const [descricaoAula, setDescricaoAula] = useState("");
  const [linkAula, setLinkAula] = useState("");
  const [avisoVideo, setAvisoVideo] = useState(null);
  const [salvandoVideo, setSalvandoVideo] = useState(false);

  const carregar = useCallback(async () => {
    const [fb, disc] = await Promise.all([listarFeedbacks(token), listarDisciplinas()]);
    setFeedbacks(fb);
    setDisciplinas(disc);
  }, [token]);

  useEffect(() => {
    (async () => {
      setCarregando(true);
      await carregar();
      setCarregando(false);
    })();
  }, [carregar]);

  async function handleCadastrarDisciplina() {
    setAvisoDisciplina(null);
    if (!materia.trim() || !duracao.trim() || !qtdAulas.trim()) {
      setAvisoDisciplina({ texto: "Preencha todos os campos.", tipo: "erro" });
      return;
    }
    setSalvandoDisciplina(true);
    try {
      const dados = await cadastrarDisciplina(token, { materia: materia.trim(), duracao: duracao.trim(), qtd_aulas: Number(qtdAulas) });
      const sucesso = /sucesso/i.test(dados?.resposta || "");
      setAvisoDisciplina({ texto: dados?.resposta || "Não foi possível cadastrar.", tipo: sucesso ? "ok" : "erro" });
      if (sucesso) {
        setMateria("");
        setDuracao("");
        setQtdAulas("");
        carregar();
      }
    } catch {
      setAvisoDisciplina({ texto: "Erro ao falar com o servidor.", tipo: "erro" });
    } finally {
      setSalvandoDisciplina(false);
    }
  }

  async function handleCadastrarVideoaula() {
    setAvisoVideo(null);
    if (!idAulaSelecionada || !nomeAula.trim() || !descricaoAula.trim() || !linkAula.trim()) {
      setAvisoVideo({ texto: "Preencha todos os campos e selecione a disciplina.", tipo: "erro" });
      return;
    }
    setSalvandoVideo(true);
    try {
      const dados = await cadastrarVideoaula(token, {
        nome_aulas: nomeAula.trim(),
        descricao: descricaoAula.trim(),
        link: linkAula.trim(),
        id_aula: idAulaSelecionada,
      });
      const sucesso = /sucesso/i.test(dados?.message || "");
      setAvisoVideo({ texto: dados?.message || "Não foi possível cadastrar a videoaula.", tipo: sucesso ? "ok" : "erro" });
      if (sucesso) {
        setNomeAula("");
        setDescricaoAula("");
        setLinkAula("");
      }
    } catch {
      setAvisoVideo({ texto: "Erro ao falar com o servidor.", tipo: "erro" });
    } finally {
      setSalvandoVideo(false);
    }
  }

  function handleExcluirFeedback(id) {
    Alert.alert("Excluir feedback", "Tem certeza que deseja excluir?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          await excluirFeedback(token, id);
          setFeedbacks((atual) => atual.filter((f) => f.id_contato !== id));
        },
      },
    ]);
  }

  if (carregando) return <LoadingScreen texto="Carregando painel administrativo..." />;

  return (
    <ScrollView style={styles.tela} contentContainerStyle={styles.conteudo}>
      <Text style={styles.eyebrow}>$ stardev --admin</Text>
      <Text style={styles.titulo}>Painel administrativo</Text>

      <Text style={styles.tituloSecao}>Nova disciplina</Text>
      <AlertBanner texto={avisoDisciplina?.texto} tipo={avisoDisciplina?.tipo} />
      <Input label="Nome da disciplina" value={materia} onChangeText={setMateria} placeholder="Ex: DesenvolvimentoMobile" />
      <Input label="Duração" value={duracao} onChangeText={setDuracao} placeholder="Ex: 1hora" />
      <Input label="Qtd. de aulas" value={qtdAulas} onChangeText={setQtdAulas} keyboardType="numeric" placeholder="Ex: 12" />
      <Button title="Cadastrar disciplina" onPress={handleCadastrarDisciplina} loading={salvandoDisciplina} />

      <Text style={[styles.tituloSecao, { marginTop: spacing.xl }]}>Nova videoaula</Text>
      <AlertBanner texto={avisoVideo?.texto} tipo={avisoVideo?.tipo} />
      <Text style={styles.rotuloSelecao}>Disciplina</Text>
      <View style={styles.chips}>
        {disciplinas.map((d) => (
          <Pressable
            key={d.id_aula}
            onPress={() => setIdAulaSelecionada(d.id_aula)}
            style={[styles.chip, idAulaSelecionada === d.id_aula && styles.chipAtivo]}
          >
            <Text style={[styles.chipTexto, idAulaSelecionada === d.id_aula && styles.chipTextoAtivo]}>{d.materia}</Text>
          </Pressable>
        ))}
      </View>
      <Input label="Nome da aula" value={nomeAula} onChangeText={setNomeAula} placeholder="Mín. 5 caracteres" />
      <Input label="Descrição" value={descricaoAula} onChangeText={setDescricaoAula} multiline placeholder="Mín. 15 caracteres" />
      <Input label="Link do YouTube" value={linkAula} onChangeText={setLinkAula} placeholder="https://youtu.be/..." autoCapitalize="none" />
      <Button title="Cadastrar videoaula" onPress={handleCadastrarVideoaula} loading={salvandoVideo} />

      <Text style={[styles.tituloSecao, { marginTop: spacing.xl }]}>Feedbacks recebidos</Text>
      {feedbacks.length === 0 ? (
        <EmptyState icone="chatbubble-ellipses-outline" texto="Nenhum feedback recebido ainda." />
      ) : (
        feedbacks.map((f) => (
          <Card key={f.id_contato} style={styles.cardFeedback}>
            <Text style={styles.nomeFeedback}>{f.nome}</Text>
            <Text style={styles.emailFeedback}>{f.email}</Text>
            <Text style={styles.comentarioFeedback}>{f.comentario}</Text>
            <Pressable onPress={() => handleExcluirFeedback(f.id_contato)}>
              <Text style={styles.linkExcluir}>Excluir</Text>
            </Pressable>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.primaria },
  conteudo: { padding: spacing.lg, paddingBottom: spacing.xxl },
  eyebrow: { fontFamily: fonts.monoRegular, color: colors.botoes, fontSize: 12, marginBottom: 4 },
  titulo: { fontFamily: fonts.displayBold, fontSize: 24, color: colors.secundaria, marginBottom: spacing.md },
  tituloSecao: { fontFamily: fonts.displayBold, fontSize: 16, color: colors.secundaria, marginBottom: spacing.sm },
  rotuloSelecao: { fontFamily: fonts.monoRegular, fontSize: 12, color: colors.secundaria, marginBottom: 6, textTransform: "uppercase" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: spacing.md },
  chip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1.5, borderColor: colors.terciaria, backgroundColor: colors.branco },
  chipAtivo: { backgroundColor: colors.botoes, borderColor: colors.botoes },
  chipTexto: { fontFamily: fonts.monoRegular, fontSize: 11.5, color: colors.secundaria },
  chipTextoAtivo: { color: colors.branco },
  cardFeedback: { marginBottom: 10 },
  nomeFeedback: { fontFamily: fonts.displayBold, fontSize: 14, color: colors.secundaria },
  emailFeedback: { fontFamily: fonts.monoRegular, fontSize: 11, color: colors.reserva, marginBottom: 6 },
  comentarioFeedback: { fontFamily: fonts.displayRegular, fontSize: 13, color: colors.letras, marginBottom: 8 },
  linkExcluir: { fontFamily: fonts.monoRegular, fontSize: 12, color: colors.erro },
});
