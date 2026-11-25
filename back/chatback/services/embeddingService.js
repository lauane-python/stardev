const fs = require("fs");
const path = require("path");

const caminhoEmbeddings = path.join(__dirname, "../data/embeddings.json");
const caminhoBase = path.join(__dirname, "../data/base_conhecimento.txt");
const DIMENSOES = 256;

function normalizarTexto(texto = "") {
    return String(texto)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9+\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function hashToken(token) {
    let h = 2166136261;
    for (let i = 0; i < token.length; i++) {
        h ^= token.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

/**
 * Gera um vetor L2-normalizado de dimensão fixa (unigramas + bigramas)
 * para busca semântica leve compatível com cosine-similarity.
 */
function textoParaVetor(texto = "") {
    const vetor = new Array(DIMENSOES).fill(0);
    const limpo = normalizarTexto(texto);
    if (!limpo) return vetor;

    const palavras = limpo.split(" ").filter((p) => p.length > 1);
    for (let i = 0; i < palavras.length; i++) {
        const idx = hashToken(palavras[i]) % DIMENSOES;
        vetor[idx] += 1;

        if (i + 1 < palavras.length) {
            const bi = `${palavras[i]}_${palavras[i + 1]}`;
            const idxBi = hashToken(bi) % DIMENSOES;
            vetor[idxBi] += 1.4;
        }
    }

    const norma = Math.sqrt(vetor.reduce((acc, v) => acc + v * v, 0));
    if (norma > 0) {
        for (let i = 0; i < vetor.length; i++) {
            vetor[i] = Number((vetor[i] / norma).toFixed(6));
        }
    }
    return vetor;
}

function dividirBaseEmSecoes(conteudo = "") {
    const linhas = String(conteudo).split(/\r?\n/);
    const secoes = [];
    let tituloAtual = "StarDev";
    let buffer = [];

    for (let i = 0; i < linhas.length; i++) {
        const linha = linhas[i].trim();
        if (/^={10,}$/.test(linha)) {
            if (buffer.length > 0) {
                const textoSecao = buffer.join("\n").trim();
                if (textoSecao) {
                    secoes.push({ titulo: tituloAtual, conteudo: textoSecao });
                }
                buffer = [];
            }
            const proxima = linhas[i + 1]?.trim();
            const apos = linhas[i + 2]?.trim();
            if (proxima && apos && /^={10,}$/.test(apos)) {
                tituloAtual = proxima;
                i += 2;
            }
            continue;
        }
        buffer.push(linhas[i]);
    }

    const resto = buffer.join("\n").trim();
    if (resto) {
        secoes.push({ titulo: tituloAtual, conteudo: resto });
    }
    return secoes;
}

function carregarEmbeddings() {
    try {
        if (!fs.existsSync(caminhoEmbeddings)) {
            return [];
        }
        const conteudo = fs.readFileSync(caminhoEmbeddings, "utf8");
        if (!conteudo.trim()) {
            return [];
        }
        const parsed = JSON.parse(conteudo);
        return Array.isArray(parsed) ? parsed : [];
    } catch (erro) {
        console.error("Erro ao carregar embeddings:", erro);
        return [];
    }
}

function salvarEmbeddings(lista) {
    try {
        fs.writeFileSync(caminhoEmbeddings, JSON.stringify(lista, null, 2), "utf8");
    } catch (erro) {
        console.error("Erro ao salvar embeddings:", erro);
    }
}

async function gerarEmbeddings() {
    try {
        if (!fs.existsSync(caminhoBase)) return [];
        const base = fs.readFileSync(caminhoBase, "utf8");
        const secoes = dividirBaseEmSecoes(base);
        const lista = secoes.map((sec, indice) => ({
            id: indice + 1,
            titulo: sec.titulo,
            conteudo: sec.conteudo,
            vetor: textoParaVetor(`${sec.titulo} ${sec.conteudo}`)
        }));
        salvarEmbeddings(lista);
        return lista;
    } catch (erro) {
        console.error("Erro ao gerar embeddings:", erro);
        return [];
    }
}

module.exports = {
    carregarEmbeddings,
    salvarEmbeddings,
    gerarEmbeddings,
    textoParaVetor,
    dividirBaseEmSecoes
};
