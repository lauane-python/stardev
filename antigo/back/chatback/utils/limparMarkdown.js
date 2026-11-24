function limparMarkdown(texto) {
    if (!texto) return "";

    return String(texto)
        .replace(/\r\n/g, "\n")
        .replace(/```[^\n]*\n?([\s\S]*?)```/g, "$1")
        .replace(/^\s{0,3}#{1,6}\s+/gm, "")
        .replace(/^\s*([-*_])\1{2,}\s*$/gm, "")
        .replace(/^\s*>\s?/gm, "")
        .replace(/^(\s*)[-*+]\s+/gm, "$1• ")
        .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
        .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
        .replace(/(\*\*|__)(.+?)\1/g, "$2")
        .replace(/(^|[\s(])\*(?!\s)([^*\n]+?)\*(?=[\s).,!?:;]|$)/g, "$1$2")
        .replace(/(^|[\s(])_(?!\s)([^_\n]+?)_(?=[\s).,!?:;]|$)/g, "$1$2")
        .replace(/~~(.+?)~~/g, "$1")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/\*\*/g, "")
        .replace(/[ \t]+\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

module.exports = limparMarkdown;
