/**
 * DEV MENTOR - Remove a sintaxe Markdown e devolve texto puro.
 * Mantém as quebras de linha e transforma listas em "• item".
 */
function limparMarkdown(texto) {
    if (!texto) return "";

    return String(texto)
        .replace(/\r\n/g, "\n")
        // blocos de código ```lang ... ``` -> mantém só o código
        .replace(/```[^\n]*\n?([\s\S]*?)```/g, "$1")
        // títulos: ### Título -> Título
        .replace(/^\s{0,3}#{1,6}\s+/gm, "")
        // linhas horizontais: --- *** ___
        .replace(/^\s*([-*_])\1{2,}\s*$/gm, "")
        // citações: > texto
        .replace(/^\s*>\s?/gm, "")
        // listas: "- item" ou "* item" -> "• item"
        .replace(/^(\s*)[-*+]\s+/gm, "$1• ")
        // imagens e links: ![alt](url) / [texto](url) -> texto
        .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
        .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
        // negrito e itálico: **x** __x__ *x* _x_
        .replace(/(\*\*|__)(.+?)\1/g, "$2")
        .replace(/(^|[\s(])\*(?!\s)([^*\n]+?)\*(?=[\s).,!?:;]|$)/g, "$1$2")
        .replace(/(^|[\s(])_(?!\s)([^_\n]+?)_(?=[\s).,!?:;]|$)/g, "$1$2")
        // tachado e código inline
        .replace(/~~(.+?)~~/g, "$1")
        .replace(/`([^`]+)`/g, "$1")
        // asteriscos soltos que sobraram (ex.: resposta cortada no meio de um **)
        .replace(/\*\*/g, "")
        // limpa espaços e linhas em branco demais
        .replace(/[ \t]+\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

module.exports = limparMarkdown;
