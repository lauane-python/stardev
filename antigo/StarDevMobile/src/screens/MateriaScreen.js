import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { colors } from "../theme/colors";
import { fonts, spacing } from "../theme/typography";
import VideoPlayer from "../components/VideoPlayer";
import EmptyState from "../components/EmptyState";
import LoadingScreen from "../components/LoadingScreen";
import { listarVideoaulas } from "../services/conteudoService";

export default function MateriaScreen({ route, navigation }) {
  const { disciplina } = route.params;
  const [videoaulas, setVideoaulas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [aulaAtiva, setAulaAtiva] = useState(null);

  useEffect(() => {
    navigation.setOptions({ title: disciplina.materia });
  }, [disciplina, navigation]);

  useEffect(() => {
    (async () => {
      const todas = await listarVideoaulas();
      const daMateria = todas.filter((v) => v.id_aula === disciplina.id_aula);
      setVideoaulas(daMateria);
      setAulaAtiva(daMateria[0] || null);
      setCarregando(false);
    })();
  }, [disciplina]);

  if (carregando) return <LoadingScreen texto="Carregando aulas..." />;

  if (videoaulas.length === 0) {
    return (
      <View style={styles.tela}>
        <EmptyState icone="videocam-off-outline" texto="Ainda não há videoaulas publicadas para essa disciplina." />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.tela}
      contentContainerStyle={styles.conteudo}
      data={videoaulas}
      keyExtractor={(item) => String(item.id_materias)}
      ListHeaderComponent={
        <View style={styles.playerWrap}>
          {aulaAtiva && <VideoPlayer link={aulaAtiva.link} nome={aulaAtiva.nome_aulas} />}
          {aulaAtiva && (
            <View style={styles.infoAtiva}>
              <Text style={styles.nomeAtiva}>{aulaAtiva.nome_aulas}</Text>
              <Text style={styles.descAtiva}>{aulaAtiva.descricao}</Text>
            </View>
          )}
          <Text style={styles.tituloLista}>Aulas desta disciplina</Text>
        </View>
      }
      renderItem={({ item, index }) => {
        const ativa = aulaAtiva?.id_materias === item.id_materias;
        return (
          <Pressable onPress={() => setAulaAtiva(item)} style={[styles.itemAula, ativa && styles.itemAulaAtiva]}>
            <Text style={[styles.numAula, ativa && styles.textoAtivo]}>{String(index + 1).padStart(2, "0")}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.nomeAula, ativa && styles.textoAtivo]} numberOfLines={1}>
                {item.nome_aulas}
              </Text>
              <Text style={[styles.descAula, ativa && styles.textoAtivoSec]} numberOfLines={2}>
                {item.descricao}
              </Text>
            </View>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.primaria },
  conteudo: { paddingBottom: spacing.xxl },
  playerWrap: { padding: spacing.lg, paddingBottom: spacing.sm },
  infoAtiva: { marginTop: spacing.md },
  nomeAtiva: { fontFamily: fonts.displayBold, fontSize: 18, color: colors.secundaria, marginBottom: 4 },
  descAtiva: { fontFamily: fonts.displayRegular, fontSize: 13.5, color: colors.letras, lineHeight: 19 },
  tituloLista: { fontFamily: fonts.monoRegular, fontSize: 12, color: colors.reserva, marginTop: spacing.lg, textTransform: "uppercase" },
  itemAula: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.terciaria,
  },
  itemAulaAtiva: { backgroundColor: colors.secundaria },
  numAula: { fontFamily: fonts.monoRegular, fontSize: 13, color: colors.reserva, width: 24 },
  nomeAula: { fontFamily: fonts.displayMedium, fontSize: 14.5, color: colors.secundaria },
  descAula: { fontFamily: fonts.displayRegular, fontSize: 12, color: colors.letras, marginTop: 2 },
  textoAtivo: { color: colors.destaque },
  textoAtivoSec: { color: colors.primaria },
});
