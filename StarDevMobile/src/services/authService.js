
import { apiUrl, fetchComTimeout } from "../config/api";

async function parseJsonSeguro(resp) {
  try {
    return await resp.json();
  } catch {
    return { resposta: "Resposta inválida do servidor." };
  }
}

export async function cadastrar({ nome, email, senha, telefone }) {
  const resp = await fetchComTimeout(apiUrl("/cadastro"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, email, senha, telefone }),
  });
  return parseJsonSeguro(resp);
}

export async function login({ email, senha }) {
  const resp = await fetchComTimeout(apiUrl("/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });
  return parseJsonSeguro(resp);
}

export async function verificarEmailExiste(email) {
  const resp = await fetchComTimeout(apiUrl("/verificarEmail"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const dados = await parseJsonSeguro(resp);
  return !!dados.existe;
}

export async function recuperarSenha({ email, novaSenha }) {
  const resp = await fetchComTimeout(apiUrl("/recuperarSenha"), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, novaSenha }),
  });
  return parseJsonSeguro(resp);
}

export async function buscarUsuarioLogado(token) {
  const resp = await fetchComTimeout(apiUrl("/usuario"), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (resp.status === 401 || resp.status === 403) {
    return { expirado: true };
  }
  return parseJsonSeguro(resp);
}

export async function atualizarUsuario(token, { nome, email, telefone, bio }) {
  const resp = await fetchComTimeout(apiUrl("/usuario"), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ nome, email, telefone, bio }),
  });
  return parseJsonSeguro(resp);
}

export async function trocarSenha(token, novaSenha) {
  const resp = await fetchComTimeout(apiUrl("/trocarSenha"), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ novaSenha }),
  });
  return parseJsonSeguro(resp);
}

export async function enviarFotoPerfil(token, arquivo) {
  const formData = new FormData();
  const nomeArquivo = arquivo.fileName || `foto_${Date.now()}.jpg`;
  const tipo = arquivo.mimeType || "image/jpeg";

  formData.append("foto", {
    uri: arquivo.uri,
    name: nomeArquivo,
    type: tipo,
  });

  const resp = await fetchComTimeout(apiUrl("/usuario/foto"), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  return parseJsonSeguro(resp);
}
