import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { fonts } from "../theme/typography";
import { extrairIdYoutube } from "../utils/validators";

export default function VideoPlayer({ link, nome }) {
  const [carregando, setCarregando] = useState(true);
  const [comErro, setComErro] = useState(false);

  const videoId = useMemo(() => extrairIdYoutube(link), [link]);

  if (!videoId) {
    return <MensagemErro texto="Vídeo temporariamente indisponível." />;
  }

  if (comErro) {
    return <MensagemErro texto="Vídeo temporariamente indisponível. Tente novamente mais tarde." />;
  }

  return (
    <View style={styles.wrap}>
      {carregando && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color={colors.destaque} size="large" />
        </View>
      )}
      <WebView
        source={{ uri: `https://www.youtube.com/embed/${videoId}?playsinline=1` }}
        style={styles.webview}
        allowsFullscreenVideo
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
        domStorageEnabled
        onLoadEnd={() => setCarregando(false)}
        onError={() => {
          setCarregando(false);
          setComErro(true);
        }}
        onHttpError={() => {
          setCarregando(false);
          setComErro(true);
        }}
        accessibilityLabel={nome}
      />
    </View>
  );
}

function MensagemErro({ texto }) {
  return (
    <View style={[styles.wrap, styles.erroWrap]}>
      <Ionicons name="warning-outline" size={34} color={colors.destaque} />
      <Text style={styles.textoErro}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: colors.letras,
  },
  webview: { flex: 1, backgroundColor: colors.letras },
  loadingOverlay: {
    position: "absolute",
    zIndex: 2,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.letras,
  },
  erroWrap: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.secundaria,
    gap: 10,
    paddingHorizontal: 20,
  },
  textoErro: {
    fontFamily: fonts.displayRegular,
    fontSize: 14,
    color: colors.primaria,
    textAlign: "center",
  },
});
