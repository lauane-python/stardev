import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { fonts, spacing } from "../theme/typography";
import StatCard from "../components/StatCard";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import LoadingScreen from "../components/LoadingScreen";
import { listarDisciplinas, listarVideoaulas } from "../services/conteudoService";

export default function TrilhasScreen({ navigation }) {
  const [disciplinas, setDisciplinas] = useState([]);
  const [videoaulas, setVideoaulas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState(false);

  const carregar = useCallback(async () => {
    setErro(false);
    try {
      const [aulas, videos] = await Promise.all([listarDisciplinas(), listarVideoaulas()]);
      setDisciplinas(aulas);
      setVideoaulas(videos);
    } catch {
      setErro(true);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setCarregando(true);
      await carregar();
      setCarregando(false);
    })();
  }, [carregar]);

  async function handleRefresh() {
    setAtualizando(true);
    await carregar();
    setAtualizando(false);
  }

  if (carregando) return <LoadingScreen texto="Carregando disciplinas..." />;

  const totalAulas = videoaulas.length;

  return (
    <View style={styles.tela}>
      <View style={styles.cabecalho}>
        <Text style={styles.eyebrow}>$ area-do-aluno</Text>
        <Text style={styles.titulo}>Trilhas de aprendizado</Text>
      </View>

      <View style={styles.stats}>
        <StatCard valor={disciplinas.length} rotulo="disciplinas disponíveis" />
        <StatCard valor={totalAulas} rotulo="videoaulas publicadas" />
        <StatCard valor="3" rotulo="níveis · iniciante ao avançado" />
      </View>

      {erro ? (
        <EmptyState icone="cloud-offline-outline" texto="Não foi possível carregar as disciplinas. Verifique se o back-end está rodando." />
      ) : disciplinas.length === 0 ? (
        <EmptyState icone="book-outline" texto="Nenhuma disciplina cadastrada ainda." />
      ) : (
        <FlatList
          data={disciplinas}
          keyExtractor={(item) => String(item.id_aula)}
          contentContainerStyle={styles.lista}
          refreshControl={<RefreshControl refreshing={atualizando} onRefresh={handleRefresh} tintColor={colors.botoes} />}
          renderItem={({ item }) => {
            const qtd = videoaulas.filter((v) => v.id_aula === item.id_aula).length;
            return (
              <Pressable onPress={() => navigation.navigate("Materia", { disciplina: item })}>
                <Card style={styles.cardDisciplina}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.nomeDisciplina}>{item.materia}</Text>
                    <Text style={styles.metaDisciplina}>
                      {item.duracao || "-"} · {qtd} aula(s)
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.reserva} />
                </Card>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.primaria },
  cabecalho: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  eyebrow: { fontFamily: fonts.monoRegular, color: colors.botoes, fontSize: 12, marginBottom: 4 },
  titulo: { fontFamily: fonts.displayBold, fontSize: 24, color: colors.secundaria, marginBottom: spacing.md },
  stats: { flexDirection: "row", paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  lista: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: 10 },
  cardDisciplina: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  nomeDisciplina: { fontFamily: fonts.displayBold, fontSize: 15.5, color: colors.secundaria, marginBottom: 2 },
  metaDisciplina: { fontFamily: fonts.monoRegular, fontSize: 11.5, color: colors.reserva },
});
