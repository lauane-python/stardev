const fs = require("fs");
const path = require("path");
const caminhoEmbeddings = path.join(
    __dirname,
    "../data/embeddings.json"
);
function carregarEmbeddings() {
    try {
        if (!fs.existsSync(caminhoEmbeddings)) {
            return [];
        }
        const conteudo = fs.readFileSync(
            caminhoEmbeddings,
            "utf8"
        );
        if (!conteudo.trim()) {
            return [];
        }
        return JSON.parse(conteudo);
    } catch (erro) {
        console.error(
            "Erro ao carregar embeddings:",
            erro
        );
        return [];
    }
}
function salvarEmbeddings(lista) {
    try {
        fs.writeFileSync(
            caminhoEmbeddings,
            JSON.stringify(
                lista,
                null,
                4
            ),
            "utf8"
        );
    } catch (erro) {
        console.error(
            "Erro ao salvar embeddings:",
            erro
        );
    }
}
async function gerarEmbeddings() {
    console.warn(
        "EmbeddingService: geração de embeddings ainda não implementada."
    );
    return [];
}
module.exports = {
    carregarEmbeddings,
    salvarEmbeddings,
    gerarEmbeddings
};