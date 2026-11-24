/**
 * ==========================================================================
 * CONTEÚDO SERVICE — disciplinas, videoaulas e contato
 * Endpoints:
 *   GET  /aulas             -> lista de disciplinas (os 12 módulos)
 *   GET  /videoaulas        -> lista de vídeos, já com o nome da matéria
 *   POST /contato           { nome, email, comentario }
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

export async function listarDisciplinas() {
  const resp = await fetchComTimeout(apiUrl("/aulas"));
  const dados = await parseJsonSeguro(resp);
  return Array.isArray(dados) ? dados : [];
}

export async function listarVideoaulas() {
  const resp = await fetchComTimeout(apiUrl("/videoaulas"));
  const dados = await parseJsonSeguro(resp);
  return Array.isArray(dados) ? dados : [];
}

export async function enviarContato({ nome, email, comentario }) {
  const resp = await fetchComTimeout(apiUrl("/contato"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, email, comentario }),
  });
  return parseJsonSeguro(resp) || { resposta: "Não foi possível enviar sua mensagem." };
}
