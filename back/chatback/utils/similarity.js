const cosineSimilarity = require("cosine-similarity");
/**
 * Calcula a similaridade entre dois vetores.
 * @param {number[]} vetorA
 * @param {number[]} vetorB
 * @returns {number}
 */
function calcularSimilaridade(vetorA, vetorB) {
    if (!Array.isArray(vetorA) || !Array.isArray(vetorB)) {
        return 0;
    }
    if (vetorA.length === 0 || vetorB.length === 0) {
        return 0;
    }
    if (vetorA.length !== vetorB.length) {
        return 0;
    }
    try {
        return cosineSimilarity(vetorA, vetorB);
    } catch (erro) {
        console.error("Erro ao calcular similaridade:", erro);
        return 0;
    }
}
module.exports = calcularSimilaridade;