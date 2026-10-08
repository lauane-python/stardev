/**
 * ==========================================
 * DEV MENTOR
 * RAG SERVICE
 * ==========================================
 * Organiza:
 * - Base de conhecimento
 * - Matéria atual
 * - Aulas da matéria
 * - Histórico da conversa
 * Tudo isso será enviado para a IA.
 */
const fs = require("fs");
const path = require("path");
const conexao = require("../../db.js");
const caminhoBase = path.join(
    __dirname,
    "../data/base_conhecimento.txt"
);
// ==========================================
// BASE DE CONHECIMENTO
// ==========================================
function obterBaseConhecimento() {
    try {
        return fs.readFileSync(
            caminhoBase,
            "utf8"
        );
    } catch (erro) {
        console.error(
            "Erro ao carregar base de conhecimento:",
            erro
        );
        return "";
    }
}
// ==========================================
// CONTEXTO DA MATÉRIA
// ==========================================
async function obterContextoMateria(
    materiaId
) {
    if (!materiaId) {
        return {
            id: null,
            nome: null,
            duracao: null,
            quantidadeAulas: null,
            aulas: []
        };
    }
    try {
        const [materias] =
            await conexao.query(
                `
                SELECT
                    id_aula,
                    materia,
                    duracao,
                    qtd_aulas
                FROM aulas
                WHERE id_aula = ?
                `,
                [materiaId]
            );
        if (materias.length === 0) {
            return {
                id: materiaId,
                nome: null,
                duracao: null,
                quantidadeAulas: null,
                aulas: []
            };
        }
        const materia = materias[0];
        const [aulas] =
            await conexao.query(
                `
                SELECT
                    id_materias,
                    nome_aulas,
                    descricao
                FROM materias
                WHERE id_aula = ?
                ORDER BY id_materias ASC
                `,
                [materiaId]
            );
        return {
            id: materia.id_aula,
            nome: materia.materia,
            duracao: materia.duracao,
            quantidadeAulas:
                materia.qtd_aulas,
            aulas: aulas.map(
                aula => ({
                    id: aula.id_materias,
                    nome: aula.nome_aulas,
                    descricao:
                        aula.descricao
                })
            )
        };
    } catch (erro) {
        console.error(
            "Erro ao buscar contexto da matéria:",
            erro
        );
        return {
            id: materiaId,
            nome: null,
            duracao: null,
            quantidadeAulas: null,
            aulas: []
        };
    }
}
// ==========================================
// CONTEXTO DA PÁGINA
// ==========================================
async function obterContextoPagina({
    pagina = "",
    materiaId = null
}) {
    const materia =
        await obterContextoMateria(
            materiaId
        );
    return {
        pagina,
        materia
    };
}
// ==========================================
// MONTA TODO O CONTEXTO
// ==========================================
async function montarContexto({
    historico = [],
    pagina = "",
    materiaId = null
}) {
    const contextoPagina =
        await obterContextoPagina({
            pagina,
            materiaId
        });
    return {
        baseConhecimento:
            obterBaseConhecimento(),
        contextoPagina,
        historico
    };
}
module.exports = {
    montarContexto
};