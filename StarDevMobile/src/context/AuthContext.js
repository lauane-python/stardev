import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_CONFIG } from "../config/api";
import * as authService from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [nivel, setNivel] = useState("U");
  const [usuario, setUsuario] = useState(null);
  const [carregandoSessao, setCarregandoSessao] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [tokenSalvo, nivelSalvo] = await Promise.all([
          AsyncStorage.getItem(API_CONFIG.CHAVE_TOKEN),
          AsyncStorage.getItem(API_CONFIG.CHAVE_USUARIO),
        ]);
        if (tokenSalvo) {
          setToken(tokenSalvo);
          try {
            setNivel(JSON.parse(nivelSalvo)?.nivel || "U");
          } catch {
            setNivel("U");
          }
        }
      } finally {
        setCarregandoSessao(false);
      }
    })();
  }, []);

  const salvarSessao = useCallback(async (novoToken, novoNivel) => {
    await AsyncStorage.setItem(API_CONFIG.CHAVE_TOKEN, novoToken);
    await AsyncStorage.setItem(API_CONFIG.CHAVE_USUARIO, JSON.stringify({ nivel: novoNivel }));
    setToken(novoToken);
    setNivel(novoNivel || "U");
  }, []);

  const entrar = useCallback(
    async (email, senha) => {
      const dados = await authService.login({ email, senha });
      if (dados.token) {
        await salvarSessao(dados.token, dados.nivel);
      }
      return dados;
    },
    [salvarSessao]
  );

  const sair = useCallback(async () => {
    await AsyncStorage.multiRemove([API_CONFIG.CHAVE_TOKEN, API_CONFIG.CHAVE_USUARIO]);
    setToken(null);
    setNivel("U");
    setUsuario(null);
  }, []);

  const atualizarPerfilLocal = useCallback((dadosParciais) => {
    setUsuario((atual) => ({ ...(atual || {}), ...dadosParciais }));
  }, []);

  const carregarUsuario = useCallback(async () => {
    if (!token) return null;
    const dados = await authService.buscarUsuarioLogado(token);
    if (dados?.expirado) {
      await sair();
      return null;
    }
    setUsuario(dados);
    return dados;
  }, [token, sair]);

  const value = useMemo(
    () => ({
      token,
      nivel,
      usuario,
      logado: !!token,
      isAdmin: nivel === "A",
      carregandoSessao,
      entrar,
      sair,
      carregarUsuario,
      atualizarPerfilLocal,
    }),
    [token, nivel, usuario, carregandoSessao, entrar, sair, carregarUsuario, atualizarPerfilLocal]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de um <AuthProvider>");
  return ctx;
}
