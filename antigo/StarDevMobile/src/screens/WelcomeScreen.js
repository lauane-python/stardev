import React from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import { colors } from "../theme/colors";
import { fonts, spacing } from "../theme/typography";
import Button from "../components/Button";
import Card from "../components/Card";

const TRILHAS = [
  { titulo: "Iniciante", desc: "Pra quem nunca programou. Lógica, HTML, CSS, JS e Git do zero." },
  { titulo: "Intermediário", desc: "Frameworks, back-end com Node, banco de dados e APIs de verdade." },
  { titulo: "Avançado", desc: "Clean code, segurança, deploy e pensamento de dev de mercado." },
];

export default function WelcomeScreen({ navigation }) {
  return (
    <ScrollView style={styles.tela} contentContainerStyle={styles.conteudo}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>$ stardev --start</Text>
        <Text style={styles.titulo}>Aprenda programação do zero até o avançado</Text>
        <Text style={styles.subtitulo}>
          12 disciplinas, videoaulas no YouTube e exercícios práticos — tudo de graça, direto no seu celular.
        </Text>
        <View style={styles.botoes}>
          <Button title="Criar minha conta" onPress={() => navigation.navigate("Cadastro")} />
          <Button title="Já tenho conta" variant="secundario" onPress={() => navigation.navigate("Login")} />
        </View>
      </View>

      <Text style={styles.secaoTitulo}>Como funciona</Text>
      {TRILHAS.map((t) => (
        <Card key={t.titulo} style={styles.cardTrilha}>
          <Text style={styles.cardTitulo}>{t.titulo}</Text>
          <Text style={styles.cardTexto}>{t.desc}</Text>
        </Card>
      ))}

      <Card style={styles.cardSobre}>
        <Text style={styles.cardTitulo}>Sobre a StarDev</Text>
        <Text style={styles.cardTexto}>
          A StarDev nasceu da vontade de reunir, num só lugar, conteúdo técnico de TI direto ao ponto — inspirada
          em plataformas de cursos online, mas com o nosso próprio conteúdo em vídeo, direto do YouTube.
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.primaria },
  conteudo: { padding: spacing.lg, paddingBottom: spacing.xxl },
  hero: { marginBottom: spacing.xl },
  eyebrow: {
    fontFamily: fonts.monoRegular,
    color: colors.botoes,
    fontSize: 13,
    marginBottom: 8,
  },
  titulo: {
    fontFamily: fonts.displayBold,
    fontSize: 30,
    color: colors.secundaria,
    marginBottom: 10,
    lineHeight: 34,
  },
  subtitulo: {
    fontFamily: fonts.displayRegular,
    fontSize: 15,
    color: colors.letras,
    marginBottom: spacing.lg,
    lineHeight: 21,
  },
  botoes: { gap: 10 },
  secaoTitulo: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    color: colors.secundaria,
    marginBottom: spacing.md,
  },
  cardTrilha: { marginBottom: spacing.sm },
  cardSobre: { marginTop: spacing.sm, backgroundColor: colors.terciaria, borderColor: colors.reserva },
  cardTitulo: { fontFamily: fonts.displayBold, fontSize: 16, color: colors.secundaria, marginBottom: 6 },
  cardTexto: { fontFamily: fonts.displayRegular, fontSize: 13.5, color: colors.letras, lineHeight: 19 },
});
