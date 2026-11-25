const fs = require("fs");
const path = require("path");
const conexao = require("../../db.js");
const calcularSimilaridade = require("../utils/similarity");
const {
    carregarEmbeddings,
    gerarEmbeddings,
    textoParaVetor
} = require("./embeddingService");

const caminhoBase = path.join(__dirname, "../data/base_conhecimento.txt");
let cacheIndices = null;

function obterBaseConhecimento() {
    try {
        return fs.readFileSync(caminhoBase, "utf8");
    } catch (erro) {
        console.error("Erro ao carregar base de conhecimento:", erro);
        return "";
    }
}

async function garantirIndices() {
    if (Array.isArray(cacheIndices) && cacheIndices.length > 0) {
        return cacheIndices;
    }
    let lista = carregarEmbeddings();
    if (!lista || lista.length === 0) {
        lista = await gerarEmbeddings();
    }
    cacheIndices = lista;
    return cacheIndices;
}

async function buscarTrechosRelevantes(pergunta = "", limite = 4) {
    try {
        const indices = await garantirIndices();
        if (!indices || indices.length === 0) {
            return [];
        }
        const vetorPergunta = textoParaVetor(pergunta);
        const ranqueados = indices
            .map((item) => ({
                titulo: item.titulo,
                conteudo: item.conteudo,
                score: calcularSimilaridade(vetorPergunta, item.vetor)
            }))
            .sort((a, b) => b.score - a.score);

        return ranqueados.slice(0, limite).filter((t) => t.score > 0.03);
    } catch (erro) {
        console.error("Erro ao ranquear trechos RAG:", erro);
        return [];
    }
}

async function obterContextoMateria(materiaId) {
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
        const [materias] = await conexao.query(
            `SELECT id_aula, materia, duracao, qtd_aulas
             FROM aulas
             WHERE id_aula = ?`,
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
        const [aulas] = await conexao.query(
            `SELECT id_materias, nome_aulas, descricao
             FROM materias
             WHERE id_aula = ?
             ORDER BY id_materias ASC`,
            [materiaId]
        );
        return {
            id: materia.id_aula,
            nome: materia.materia,
            duracao: materia.duracao,
            quantidadeAulas: materia.qtd_aulas,
            aulas: aulas.map((aula) => ({
                id: aula.id_materias,
                nome: aula.nome_aulas,
                descricao: aula.descricao
            }))
        };
    } catch (erro) {
        console.error("Erro ao buscar contexto da matéria:", erro);
        return {
            id: materiaId,
            nome: null,
            duracao: null,
            quantidadeAulas: null,
            aulas: []
        };
    }
}

async function obterContextoPagina({ pagina = "", materiaId = null }) {
    const materia = await obterContextoMateria(materiaId);
    return { pagina, materia };
}

async function montarContexto({
    pergunta = "",
    historico = [],
    pagina = "",
    materiaId = null
}) {
    const [contextoPagina, trechosRelevantes] = await Promise.all([
        obterContextoPagina({ pagina, materiaId }),
        buscarTrechosRelevantes(pergunta, 4)
    ]);

    const baseConhecimento =
        trechosRelevantes.length > 0
            ? trechosRelevantes.map((t) => `[${t.titulo}]\n${t.conteudo}`).join("\n\n")
            : obterBaseConhecimento();

    return {
        baseConhecimento,
        trechosRelevantes,
        contextoPagina,
        historico
    };
}

module.exports = {
    montarContexto,
    buscarTrechosRelevantes
};
