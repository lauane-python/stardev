/**
 * ==========================================================================
 * ADMIN SERVICE — só funciona pra usuários com nivel === "A" (o back-end
 * confere isso de novo no token, então essas rotas são protegidas em
 * dobro: aqui na UI e no server.js).
 * Endpoints:
 *   GET    /feedbacks
 *   PUT    /feedbacks/:id
 *   DELETE /feedbacks/:id
 *   POST   /CadastroAulas   { materia, duracao, qtd_aulas }
 *   POST   /videoaulas      { nome_aulas, descricao, link, id_aula }
 * ==========================================================================
 */
import { apiUrl, fetchComTimeout } from "../config/api";

async function parseJsonSeguro(resp) {
  try {
    return await resp.json();
  } catch {
    return null;
  }
}

function cabecalhos(token) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function listarFeedbacks(token) {
  const resp = await fetchComTimeout(apiUrl("/feedbacks"), {
    headers: cabecalhos(token),
  });
  const dados = await parseJsonSeguro(resp);
  return Array.isArray(dados) ? dados : [];
}

export async function excluirFeedback(token, id) {
  const resp = await fetchComTimeout(apiUrl(`/feedbacks/${id}`), {
    method: "DELETE",
    headers: cabecalhos(token),
  });
  return parseJsonSeguro(resp);
}

export async function cadastrarDisciplina(token, { materia, duracao, qtd_aulas }) {
  const resp = await fetchComTimeout(apiUrl("/CadastroAulas"), {
    method: "POST",
    headers: cabecalhos(token),
    body: JSON.stringify({ materia, duracao, qtd_aulas }),
  });
  return parseJsonSeguro(resp);
}

export async function cadastrarVideoaula(token, { nome_aulas, descricao, link, id_aula }) {
  const resp = await fetchComTimeout(apiUrl("/videoaulas"), {
    method: "POST",
    headers: cabecalhos(token),
    body: JSON.stringify({ nome_aulas, descricao, link, id_aula }),
  });
  return parseJsonSeguro(resp);
}
